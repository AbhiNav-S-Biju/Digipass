const pool = require('./db');

async function checkSchema() {
  try {
    console.log('Checking digital_assets table structure...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'digital_assets'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Table "digital_assets" does not exist');
      return;
    }
    
    console.log('Current columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if account_password exists
    const hasPasswordColumn = result.rows.some(r => r.column_name === 'account_password');
    
    if (!hasPasswordColumn) {
      console.log('\n⚠️  Missing column: account_password');
      console.log('Adding account_password column...');
      
      await pool.query(`
        ALTER TABLE digital_assets
        ADD COLUMN account_password TEXT
      `);
      
      console.log('✅ Column added successfully');
    } else {
      console.log('\n✅ account_password column exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
