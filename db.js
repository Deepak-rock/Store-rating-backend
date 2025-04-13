const {Client} = require('pg');

const db = new Client({
  host: '127.0.0.1',
  user: 'postgres',
  port: 5432,
  password: 'root123',
  database: 'ratingPlatfromDB',
});

db.connect()
.then(() => console.log('DB Connected'))
.catch((err) => console.log(err))

module.exports = db;