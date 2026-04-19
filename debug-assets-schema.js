const pool = require('./db');

async function debugAssetsSchema() {
  try {
    console.log('\n===== CHECKING ASSET SCHEMA =====\n');

    // Get the raw asset row with ALL columns
    const allColumns = await pool.query(`
      SELECT *
      FROM digital_assets
      WHERE user_id = 7
      LIMIT 1
    `);

    if (allColumns.rows.length > 0) {
      console.log('All columns in asset row:');
      console.log(JSON.stringify(allColumns.rows[0], null, 2));
    }

    // Check table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'digital_assets'
      ORDER BY ordinal_position
    `);

    console.log('\n\nTable structure:');
    tableInfo.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check what data is in old columns (if they exist)
    try {
      const oldSchema = await pool.query(`
        SELECT asset_id, asset_name, asset_type, encrypted_data
        FROM digital_assets
        WHERE user_id = 7
      `);
      
      console.log('\n\nOld schema columns (asset_name, asset_type, encrypted_data):');
      console.log(JSON.stringify(oldSchema.rows, null, 2));
    } catch (e) {
      console.log('\n\nOld schema columns do not exist or are not accessible');
    }

    process.exit(0);
  } catch (error) {
    console.error('Debug Error:', error);
    process.exit(1);
  }
}

debugAssetsSchema();
