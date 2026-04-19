const pool = require('./db');

async function checkFullSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'digital_assets'
      ORDER BY ordinal_position
    `);
    
    console.log('Full schema:\n');
    result.rows.forEach(r => {
      const nullable = r.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
      const def = r.column_default || 'no default';
      console.log(`  ${r.column_name}: ${r.data_type} (${nullable}, ${def})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkFullSchema();
