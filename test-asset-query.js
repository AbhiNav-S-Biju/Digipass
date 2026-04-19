const pool = require('./db');

async function testAssetQuery() {
  try {
    console.log('\n===== TESTING ASSET QUERY WITH COALESCE =====\n');

    const userId = 7;

    // This is the EXACT query from the fixed getExecutorAssets function
    const result = await pool.query(
      `SELECT 
        asset_id,
        COALESCE(platform_name, asset_name) as platform_name,
        COALESCE(category, asset_type) as category,
        account_identifier,
        action_type,
        last_message,
        encrypted_data,
        created_at
       FROM digital_assets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    console.log(`Assets found: ${result.rows.length}\n`);

    // Now transform like the API does
    const transformedAssets = result.rows
      .map(asset => {
        let accountIdentifier = asset.account_identifier;
        let actionType = asset.action_type;
        let lastMessage = asset.last_message;

        // If using old schema, parse encrypted_data to extract account info
        if (!accountIdentifier && asset.encrypted_data) {
          try {
            const decrypted = JSON.parse(asset.encrypted_data);
            accountIdentifier = decrypted.account || null;
            actionType = decrypted.action || null;
            lastMessage = decrypted.message || null;
          } catch (e) {
            console.warn(`Failed to parse encrypted_data for asset ${asset.asset_id}`);
          }
        }

        return {
          asset_id: asset.asset_id,
          platform_name: asset.platform_name,
          category: asset.category,
          account_identifier: accountIdentifier,
          action_type: actionType,
          last_message: lastMessage,
          created_at: asset.created_at
        };
      })
      .filter(asset => asset.platform_name !== null && asset.platform_name !== undefined);

    console.log('Transformed Assets:');
    console.log(JSON.stringify(transformedAssets, null, 2));

    console.log(`\n\nTotal visible assets: ${transformedAssets.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Test Error:', error);
    process.exit(1);
  }
}

testAssetQuery();
