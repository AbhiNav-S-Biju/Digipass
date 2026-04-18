const pool = require('./db.js');

(async () => {
  try {
    const r = await pool.query(
      `UPDATE digital_assets 
       SET platform_name = $1, category = $2, account_identifier = $3, action_type = $4 
       WHERE asset_id = 9 
       RETURNING *`,
      ['Instagram', 'Social', 'abhinavbijusn@gmail.com', 'pass']
    );
    
    console.log('✓ Asset 9 updated with new schema:');
    console.log(`  - platform_name: ${r.rows[0].platform_name}`);
    console.log(`  - category: ${r.rows[0].category}`);
    console.log(`  - account_identifier: ${r.rows[0].account_identifier}`);
    console.log(`  - action_type: ${r.rows[0].action_type}`);
    
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
