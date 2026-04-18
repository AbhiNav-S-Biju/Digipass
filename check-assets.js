const pool = require('./db.js');

(async () => {
  try {
    const exec = await pool.query(
      'SELECT executor_id, user_id, executor_email, verification_status, access_granted FROM executors WHERE executor_email = $1',
      ['abhi.biju.135@gmail.com']
    );
    
    if (exec.rows.length === 0) {
      console.log('No executor found');
      process.exit(0);
    }
    
    // Get the one with verified status and access granted
    const executor = exec.rows.find(e => e.verification_status === 'verified');
    if (!executor) {
      console.log('No verified executor found');
      console.log('Available executors:');
      console.table(exec.rows);
      process.exit(0);
    }
    
    console.log('\nExecutor:', executor);
    
    const assets = await pool.query(
      'SELECT asset_id, platform_name, category, account_identifier, action_type FROM digital_assets WHERE user_id = $1',
      [executor.user_id]
    );
    
    console.log('\nAssets for user', executor.user_id, ':');
    if (assets.rows.length === 0) {
      console.log('NO ASSETS FOUND - Owner needs to add digital assets');
    } else {
      console.table(assets.rows);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
