const { Pool } = require('pg');

const pool = new Pool({
  // Pick external by default, internal if explicitly set
  connectionString: process.env.DATABASE_URL_EXTERNAL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

module.exports = pool;
