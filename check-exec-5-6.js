const pool = require('./db.js');

(async () => {
  try {
    const r = await pool.query('SELECT * FROM executors WHERE executor_id IN (5, 6) ORDER BY executor_id');
    
    console.log('Executors 5 & 6 in Neon:');
    console.table(r.rows);
    
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
})();
