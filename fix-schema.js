const pool = require('./db');

async function fixSchema() {
  try {
    console.log('Updating table schema to support new asset format...');
    
    // Make old required columns nullable and add defaults
    await pool.query(`
      ALTER TABLE digital_assets
      ALTER COLUMN asset_name DROP NOT NULL,
      ALTER COLUMN asset_type DROP NOT NULL,
      ALTER COLUMN encrypted_data DROP NOT NULL
    `);
    
    console.log('✅ Removed NOT NULL constraints from old columns');
    
    // Add defaults
    await pool.query(`
      ALTER TABLE digital_assets
      ALTER COLUMN asset_name SET DEFAULT 'N/A',
      ALTER COLUMN asset_type SET DEFAULT 'account',
      ALTER COLUMN encrypted_data SET DEFAULT ''
    `);
    
    console.log('✅ Added default values to old columns');
    console.log('\nSchema update complete. Assets can now be created with new format.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

fixSchema();
