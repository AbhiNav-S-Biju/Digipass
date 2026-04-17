const pool = require('./db');

pool.query('SELECT * FROM users LIMIT 1', (err, res) => {
  if (err) {
    console.log('ERROR:', err.message);
    console.log('Code:', err.code);
  } else {
    console.log('SUCCESS! Database connected');
    console.log('Users table found. Rows:', res.rows.length);
  }
  pool.end();
});
