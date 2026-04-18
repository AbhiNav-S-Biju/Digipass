const pool = require('./db.js');

async function addPasswordsToAssets() {
  try {
    console.log('Adding passwords to existing assets...');

    // Update asset 11 (Instagram)
    const result1 = await pool.query(
      `UPDATE digital_assets 
       SET account_password = $1 
       WHERE asset_id = $2 
       RETURNING asset_id, platform_name, account_identifier, account_password`,
      ['insta@123secure', 11]
    );
    
    if (result1.rows.length > 0) {
      console.log('✅ Asset 11 updated:', result1.rows[0]);
    }

    // Update asset 13 (Discord)
    const result2 = await pool.query(
      `UPDATE digital_assets 
       SET account_password = $1 
       WHERE asset_id = $2 
       RETURNING asset_id, platform_name, account_identifier, account_password`,
      ['discord@secure456', 13]
    );
    
    if (result2.rows.length > 0) {
      console.log('✅ Asset 13 updated:', result2.rows[0]);
    }

    // Show all assets with passwords
    const allAssets = await pool.query(
      `SELECT asset_id, platform_name, account_identifier, account_password 
       FROM digital_assets 
       ORDER BY asset_id`
    );
    
    console.log('\n📋 All assets:');
    allAssets.rows.forEach(asset => {
      console.log(`  Asset ${asset.asset_id}: ${asset.platform_name} - ${asset.account_identifier} - Password: ${asset.account_password || '(none)'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addPasswordsToAssets();
