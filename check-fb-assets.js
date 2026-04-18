const pool = require('./db.js');

(async () => {
  try {
    const result = await pool.query(
      `SELECT asset_id, user_id, platform_name, category, account_identifier, action_type, created_at 
       FROM digital_assets 
       WHERE platform_name = $1 OR platform_name = $2 
       ORDER BY created_at DESC LIMIT 5`,
      ['Facebook', 'LinkedIn']
    );
    console.log('\nFacebook & LinkedIn assets:');
    console.table(result.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
