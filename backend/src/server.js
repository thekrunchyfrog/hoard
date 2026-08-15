import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import * as mariadb from 'mariadb';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Root directory images are stored under. In Docker this is the shared
// `webapp-images` volume mounted at /app/images (and also mounted into the
// frontend container at /app/public/images so Vite/nginx can serve it
// directly). For local, non-Docker dev it points at frontend/public/images.
const IMAGES_ROOT = process.env.IMAGES_ROOT || '/app/images';

// Thumbnail width (px) generated alongside the original upload. Height is
// derived automatically to preserve the original aspect ratio.
const THUMBNAIL_WIDTH = 350;

const ALLOWED_UPLOAD_MIME_TYPES = new Set(['image/jpeg', 'image/webp']);

// Accept uploads directly into memory - no size limit for this first pass,
// per product decision. Files get written to disk ourselves after basic
// mime-type validation, once we know the target photo_location folder.
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

// Test database connection
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log('Connected to MariaDB successfully');
  } catch (err) {
    console.error('Failed to connect to MariaDB:', err.message);
    process.exit(1);
  }
}

// Look up a collection's table name from the `collection` table and make sure
// it's a known value before it's ever interpolated into SQL. This is the
// whitelist that keeps table-name interpolation safe (identifiers can't be
// parameterized with normal placeholders).
async function resolveCollectionTable(collectionTable) {
  const rows = await pool.query(
    'SELECT collection_table FROM collection WHERE collection_table = ?',
    [collectionTable]
  );
  if (rows.length === 0) return null;
  return rows[0].collection_table;
}

// Look up a table's actual primary key column name. Collection tables don't
// consistently follow a `<table>_id` naming convention (e.g. skipper_fashion
// uses plain `id` while lunchbox uses `lunchbox_id`), so this asks MariaDB
// directly instead of guessing from the table name. `table` must already be
// a value that's passed through resolveCollectionTable's whitelist check.
async function resolveIdColumn(table) {
  const rows = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
     LIMIT 1`,
    [table]
  );
  if (rows.length === 0) return null;
  return rows[0].COLUMN_NAME;
}

// Require a shared-secret token (X-Admin-Token header) for write operations.
// Simple bearer-style check, no sessions/users - fine for a personal,
// localhost-first app. If ADMIN_TOKEN isn't configured, refuse all writes
// rather than silently allowing them.
function requireAdminToken(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(503).json({ error: 'Admin token not configured on server' });
  }
  const provided = req.get('X-Admin-Token');
  if (!provided || provided !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// API Routes

// Get all collections
app.get('/api/collections', async (req, res) => {
  try {
    const rows = await pool.query('SELECT * FROM collection ORDER BY collection_name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching collections:', err.message);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get items by collection ID
app.get('/api/collections/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const table = await resolveCollectionTable(id);
    if (!table) {
      return res.status(404).json({ error: 'Unknown collection' });
    }
    const sql = `SELECT * FROM \`${table}\``;
    const rows = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create a new item in a collection (admin only)
app.post('/api/collections/:id/items', requireAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const table = await resolveCollectionTable(id);
    if (!table) {
      return res.status(404).json({ error: 'Unknown collection' });
    }

    const body = req.body || {};
    const fields = Object.keys(body);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided' });
    }

    const columns = fields.map((f) => `\`${f}\``).join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((f) => body[f]);

    const sql = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`;
    const result = await pool.query(sql, values);
    res.status(201).json({ id: result.insertId, ...body });
  } catch (err) {
    console.error('Error creating item:', err.message);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update an existing item in a collection (admin only)
app.put('/api/collections/:id/items/:itemId', requireAdminToken, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const table = await resolveCollectionTable(id);
    if (!table) {
      return res.status(404).json({ error: 'Unknown collection' });
    }

    const body = req.body || {};
    const fields = Object.keys(body);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided' });
    }

    const idColumn = await resolveIdColumn(table);
    if (!idColumn) {
      return res.status(500).json({ error: 'Could not resolve id column for collection' });
    }
    const setClause = fields.map((f) => `\`${f}\` = ?`).join(', ');
    const values = fields.map((f) => body[f]);

    const sql = `UPDATE \`${table}\` SET ${setClause} WHERE \`${idColumn}\` = ?`;
    const result = await pool.query(sql, [...values, itemId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ id: itemId, ...body });
  } catch (err) {
    console.error('Error updating item:', err.message);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Get items photos by photo_location
app.get('/api/photos/:photo_location', async (req, res) => {
  let foto_content = [];
  try {
    const { photo_location } = req.params;
    const directoryPath = path.join(IMAGES_ROOT, photo_location);
    const files = await readdir(directoryPath);
    files.forEach(file => {
      if (file.endsWith('.webp')) {
        foto_content.push({ url: `/images/${photo_location}/${file}`.replace('.webp', ''), label: file.match(/_([^\.]+)\./)?.[1] || file });
      }
    });
    if (foto_content.length === 0) {
      console.log('No images found for photo_location:', photo_location);
      foto_content.push({ url: `/images/no_images`, label: 'no images' });
    }
    res.json(foto_content);
  } catch (err) {
    console.error('Error fetching photos:', err.message);
    foto_content.push({ url: `/images/no_images`, label: 'no images' });
    res.json(foto_content);
  }
});

// Upload one or more images for an item (admin only).
//
// The target folder is the item's own `photo_location` value (looked up
// from the collection table by id, same whitelisting pattern as
// resolveCollectionTable), created on demand if it doesn't exist yet.
//
// For each uploaded file we keep the original (jpg/webp) as uploaded, and
// additionally generate a `<name>_thumb.webp` copy resized to a fixed
// width (aspect ratio preserved) so the gallery/list views have something
// light to load. No file count or size limit in this first pass.
app.post(
  '/api/collections/:id/items/:itemId/images',
  requireAdminToken,
  upload.array('images'),
  async (req, res) => {
    try {
      const { id, itemId } = req.params;
      const table = await resolveCollectionTable(id);
      if (!table) {
        return res.status(404).json({ error: 'Unknown collection' });
      }

      const idColumn = await resolveIdColumn(table);
      if (!idColumn) {
        return res.status(500).json({ error: 'Could not resolve id column for collection' });
      }
      const rows = await pool.query(
        `SELECT photo_location FROM \`${table}\` WHERE \`${idColumn}\` = ?`,
        [itemId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      const photoLocation = rows[0].photo_location;
      if (!photoLocation) {
        return res.status(400).json({
          error: 'Item has no photo_location set; cannot store images for it',
        });
      }

      const files = req.files || [];
      if (files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      const rejected = files.filter((f) => !ALLOWED_UPLOAD_MIME_TYPES.has(f.mimetype));
      if (rejected.length > 0) {
        return res.status(400).json({
          error: `Only JPG or WEBP images are accepted (rejected: ${rejected
            .map((f) => f.originalname)
            .join(', ')})`,
        });
      }

      const targetDir = path.join(IMAGES_ROOT, photoLocation);
      await mkdir(targetDir, { recursive: true });

      const saved = [];
      for (const file of files) {
        const isWebp = file.mimetype === 'image/webp';
        const baseName = path
          .basename(file.originalname, path.extname(file.originalname))
          .replace(/[^a-zA-Z0-9_-]/g, '_') || 'image';
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        const sharedName = `${baseName}_${uniqueSuffix}`;

        if (isWebp) {
          // Already webp: resize in place instead of keeping a separate
          // full-size original + identically-named thumbnail (which would
          // collide on the same filename).
          const filename = `${sharedName}.webp`;
          await sharp(file.buffer)
            .resize({ width: THUMBNAIL_WIDTH })
            .webp()
            .toFile(path.join(targetDir, filename));

          saved.push({
            original: `/images/${photoLocation}/${filename}`,
            thumbnail: `/images/${photoLocation}/${filename}`,
          });
        } else {
          // JPG upload: keep the full-size original as-is, and generate a
          // resized webp copy sharing the same base filename.
          const originalFilename = `${sharedName}.jpg`;
          const thumbFilename = `${sharedName}.webp`;

          await sharp(file.buffer).toFile(path.join(targetDir, originalFilename));
          await sharp(file.buffer)
            .resize({ width: THUMBNAIL_WIDTH })
            .webp()
            .toFile(path.join(targetDir, thumbFilename));

          saved.push({
            original: `/images/${photoLocation}/${originalFilename}`,
            thumbnail: `/images/${photoLocation}/${thumbFilename}`,
          });
        }
      }

      res.status(201).json({ photo_location: photoLocation, uploaded: saved });
    } catch (err) {
      console.error('Error uploading images:', err.message);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
testConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
