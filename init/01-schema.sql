-- Se ejecuta automáticamente al inicializar el contenedor de PostgreSQL
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  nombre   TEXT NOT NULL,
  pedido   TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);
