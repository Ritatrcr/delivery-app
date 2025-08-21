const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST ,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  max: 10,
  idleTimeoutMillis: 30000
});

module.exports = pool;
