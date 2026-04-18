const pool = require('./db.js');

(async () => {
  try {
    const r = await pool.query(
      'SELECT executor_id, user_id, executor_name, executor_email, verification_status, access_granted FROM executors WHERE executor_email = $1',
      ['abhi.biju.135@gmail.com']
    );
    
    console.log('All executors with abhi.biju.135@gmail.com:');
    console.table(r.rows);
    
    for(const ex of r.rows) {
      const u = await pool.query('SELECT full_name FROM users WHERE user_id = $1', [ex.user_id]);
      console.log(`Executor ${ex.executor_id} -> User ${ex.user_id}: ${u.rows[0]?.full_name || 'NOT FOUND'}`);
    }
    
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
})();
