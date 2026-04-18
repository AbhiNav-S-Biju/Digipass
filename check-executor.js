const pool = require('./db.js');

(async () => {
  try {
    const result = await pool.query(
      'SELECT executor_id, executor_email, verification_status, access_granted, executor_password_hash FROM executors WHERE executor_email ILIKE $1',
      ['%abhi.biju.135%']
    );
    console.log('\nExecutors with abhi.biju.135@gmail.com:');
    console.table(result.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
