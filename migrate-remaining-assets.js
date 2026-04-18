const pool = require('./db.js');

(async () => {
  try {
    // Get all assets with old schema but NULL new schema columns
    const result = await pool.query(`
      SELECT * FROM digital_assets 
      WHERE asset_name IS NOT NULL 
      AND platform_name IS NULL
    `);

    console.log(`Found ${result.rows.length} assets to migrate`);

    for (const asset of result.rows) {
      let accountIdentifier = null;
      let actionType = 'pass';
      let lastMessage = null;

      if (asset.encrypted_data) {
        try {
          const data = JSON.parse(asset.encrypted_data);
          accountIdentifier = data.account || null;
          actionType = data.action || 'pass';
          lastMessage = data.message || null;
        } catch (e) {
          console.error(`Failed to parse encrypted_data for asset ${asset.asset_id}`);
        }
      }

      const updateResult = await pool.query(
        `UPDATE digital_assets 
         SET platform_name = $1, 
             category = $2, 
             account_identifier = $3, 
             action_type = $4, 
             last_message = $5 
         WHERE asset_id = $6`,
        [
          asset.asset_name,
          asset.asset_type,
          accountIdentifier,
          actionType,
          lastMessage,
          asset.asset_id
        ]
      );

      console.log(`✓ Migrated Asset ${asset.asset_id}: ${asset.asset_name} → ${accountIdentifier}`);
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
