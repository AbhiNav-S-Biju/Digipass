const pool = require('./db.js');

(async () => {
  try {
    const r = await pool.query(
      `UPDATE users 
       SET full_name = $1, email = $2 
       WHERE user_id = 2 
       RETURNING *`,
      ['AbhiTest', 'abhitest@gmail.com']
    );
    
    console.log('Updated User 2:');
    console.table(r.rows);
    
    // Now verify executor is connected to this user
    const exec = await pool.query(
      `SELECT executor_id, user_id, executor_name, executor_email 
       FROM executors 
       WHERE executor_id = 8`
    );
    
    console.log('\nExecutor 8 connection:');
    console.table(exec.rows);
    
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
})();
