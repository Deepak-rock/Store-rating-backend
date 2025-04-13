const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

db.connect()
  .then(() => console.log('DB Connected'))
  .catch((err) => console.error('DB Connection Error:', err.stack));

module.exports = db;