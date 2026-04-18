const pool = require('./db.js');

(async () => {
  try {
    const exResult = await pool.query(
      `SELECT executor_id, user_id, executor_email, executor_name 
       FROM executors 
       WHERE verification_status='verified' AND access_granted=true`
    );
    
    console.log('\nVerified & Granted Executors:');
    console.table(exResult.rows);
    
    for(const ex of exResult.rows) {
      const userResult = await pool.query(
        'SELECT user_id, full_name, email FROM users WHERE user_id=$1',
        [ex.user_id]
      );
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        console.log(`\nExecutor ${ex.executor_id} (${ex.executor_email})`);
        console.log(`  -> Connected to User ${ex.user_id}: "${user.full_name}" (${user.email})`);
      }
    }
    
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
})();
