require('dotenv').config();
// db/index.js
const { Pool } = require('pg');

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
});

