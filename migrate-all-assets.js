const pool = require('./db.js');

(async () => {
  try {
    // Find all assets with old schema (asset_name filled, platform_name NULL)
    const oldAssets = await pool.query(
      `SELECT asset_id, asset_name, asset_type, encrypted_data 
       FROM digital_assets 
       WHERE platform_name IS NULL AND asset_name IS NOT NULL`
    );
    
    console.log(`Found ${oldAssets.rows.length} assets with old schema to migrate...`);
    
    for (const asset of oldAssets.rows) {
      let accountId = null;
      let actionType = 'pass';
      
      try {
        const data = JSON.parse(asset.encrypted_data);
        accountId = data.account || null;
        actionType = data.action || 'pass';
      } catch (e) {
        // If JSON parse fails, use defaults
      }
      
      const result = await pool.query(
        `UPDATE digital_assets 
         SET platform_name = $1, category = $2, account_identifier = $3, action_type = $4 
         WHERE asset_id = $5 
         RETURNING asset_id, platform_name, category, account_identifier, action_type`,
        [asset.asset_name, asset.asset_type, accountId, actionType, asset.asset_id]
      );
      
      console.log(`✓ Asset ${result.rows[0].asset_id}: ${result.rows[0].platform_name} (${result.rows[0].category})`);
    }
    
    console.log(`\n✅ Migration complete!`);
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
