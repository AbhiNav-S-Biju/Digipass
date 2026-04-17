const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Digipass',
  password: process.env.DB_PASSWORD || 'michu@123',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_HOST?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

module.exports = pool;