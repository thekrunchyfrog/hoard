import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import * as mariadb from 'mariadb';
import { readdir } from 'node:fs/promises';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    const sql = `SELECT * FROM ${id}`;
    const rows = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.status(500).json({ error: 'Failed to fetch items' });
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
    res.json(foto_content);
  } catch (err) {
    console.error('Error fetching photos:', err.message);
    res.json([]);
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
