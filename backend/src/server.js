import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import * as mariadb from 'mariadb';
import { readdir } from 'node:fs/promises';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

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

    const idColumn = `${table}_id`;
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
    const directoryPath = `/app/images/${photo_location}`;
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
