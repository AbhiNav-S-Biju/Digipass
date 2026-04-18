const pool = require('./db.js');

(async () => {
  try {
    console.log('🔄 Migrating digital_assets table...');
    
    // Add new columns if they don't exist
    const columnResults = await pool.query(`
      ALTER TABLE digital_assets
      ADD COLUMN IF NOT EXISTS platform_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS category VARCHAR(100),
      ADD COLUMN IF NOT EXISTS account_identifier VARCHAR(255),
      ADD COLUMN IF NOT EXISTS action_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS last_message TEXT
    `);
    
    console.log('✓ Added new columns to digital_assets table');
    
    // Verify the schema
    const schemaResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'digital_assets'
      ORDER BY ordinal_position
    `);
    
    console.log('\n✓ Digital Assets Table Schema:');
    schemaResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch(err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
})();
