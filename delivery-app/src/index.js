
require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.APP_PORT || 3000;

// Crea la tabla si no existe
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id SERIAL PRIMARY KEY,
      nombre   TEXT NOT NULL,
      pedido   TEXT NOT NULL,
      cantidad INTEGER NOT NULL CHECK (cantidad > 0),
      creado_en TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}
app.use(express.static('public')); // sirve /index.html, /main.js, /styles.css

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up' });
  } catch (err) {
    res.status(500).json({ status: 'ok', db: 'down', error: err.message });
  }
});

// Realizar un pedido
app.post('/orders', async (req, res) => {
  const { nombre, pedido, cantidad } = req.body;

  if (!nombre || !pedido || !Number.isInteger(cantidad) || cantidad <= 0) {
    return res.status(400).json({
      error: 'Campos requeridos: nombre (string), pedido (string), cantidad (entero > 0)'
    });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO pedidos (nombre, pedido, cantidad) VALUES ($1, $2, $3) RETURNING *',
      [nombre, pedido, cantidad]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar pedidos
app.get('/orders', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
  res.json(rows);
});

(async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`delivery-app escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error inicializando la app:', err);
    process.exit(1);
  }
})();
