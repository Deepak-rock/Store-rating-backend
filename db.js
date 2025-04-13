const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const db = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect()
  .then(() => console.log('DB Connected'))
  .catch((err) => console.error('DB Connection Error:', err.stack));

module.exports = db;