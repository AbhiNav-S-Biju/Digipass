const pool = require('./db');

/**
 * One-time migration script to convert old assets to new schema
 * This moves data from encrypted_data JSON to proper schema columns
 * 
 * SAFE: Only updates assets that have encrypted_data and NULL new columns
 * SAFE: Keeps encrypted_data column as backup
 * RUN ONCE: After this, all endpoints work without special schema handling
 */

async function migrateAssetsSchema() {
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  try {
    console.log('\n===== STARTING ASSET SCHEMA MIGRATION =====\n');

    // Get all assets with old schema data
    const { rows: assetsToMigrate } = await pool.query(`
      SELECT asset_id, user_id, asset_name, asset_type, encrypted_data, 
             platform_name, category, account_identifier, action_type, account_password, last_message
      FROM digital_assets
      WHERE encrypted_data IS NOT NULL
      ORDER BY asset_id
    `);

    console.log(`Found ${assetsToMigrate.length} assets with encrypted_data\n`);

    for (const asset of assetsToMigrate) {
      try {
        // Skip if new schema columns already populated
        if (asset.platform_name || asset.category || asset.account_identifier) {
          console.log(`✓ Asset ${asset.asset_id} - Already migrated, skipping`);
          skippedCount++;
          continue;
        }

        // Parse encrypted data
        let accountIdentifier = null;
        let accountPassword = null;
        let actionType = 'pass';
        let lastMessage = null;

        try {
          const decrypted = JSON.parse(asset.encrypted_data);
          accountIdentifier = decrypted.account || null;
          accountPassword = decrypted.password || null;
          actionType = decrypted.action || 'pass';
          lastMessage = decrypted.message || null;
        } catch (parseError) {
          console.error(`⚠ Asset ${asset.asset_id} - Failed to parse encrypted_data:`, parseError.message);
          errorCount++;
          continue;
        }

        // Update the new schema columns
        await pool.query(
          `UPDATE digital_assets
           SET 
             platform_name = $1,
             category = $2,
             account_identifier = $3,
             account_password = $4,
             action_type = $5,
             last_message = $6,
             updated_at = CURRENT_TIMESTAMP
           WHERE asset_id = $7`,
          [
            asset.asset_name,
            asset.asset_type,
            accountIdentifier,
            accountPassword,
            actionType,
            lastMessage,
            asset.asset_id
          ]
        );

        console.log(`✓ Asset ${asset.asset_id} (${asset.asset_name}) - Migrated successfully`);
        successCount++;
      } catch (error) {
        console.error(`✗ Asset ${asset.asset_id} - Migration failed:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n===== MIGRATION COMPLETE =====`);
    console.log(`✓ Successfully migrated: ${successCount}`);
    console.log(`⚠ Already migrated (skipped): ${skippedCount}`);
    console.log(`✗ Failed: ${errorCount}`);
    console.log(`\nTotal: ${successCount + skippedCount + errorCount} assets processed\n`);

    // Verify the migration
    const { rows: unmigrated } = await pool.query(`
      SELECT COUNT(*) as count
      FROM digital_assets
      WHERE encrypted_data IS NOT NULL
        AND (platform_name IS NULL OR category IS NULL)
    `);

    console.log(`Verification: ${unmigrated[0].count} assets still need migration`);

    if (unmigrated[0].count === 0) {
      console.log('✓ All assets successfully migrated to new schema!\n');
    }

    process.exit(successCount > 0 || errorCount > 0 ? 0 : 1);
  } catch (error) {
    console.error('Migration Error:', error);
    process.exit(1);
  }
}

migrateAssetsSchema();
