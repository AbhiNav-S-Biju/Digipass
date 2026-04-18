const pool = require('./db.js');

(async () => {
  try {
    console.log('Starting data cleanup...');
    
    // Delete data from all tables (respecting foreign keys)
    const tables = [
      'dead_mans_switch',
      'digital_will',
      'digital_assets',
      'executors',
      'users'
    ];
    
    for (const table of tables) {
      const result = await pool.query(`DELETE FROM ${table}`);
      console.log(`✓ Cleared ${table}: ${result.rowCount} rows deleted`);
    }
    
    console.log('\n✅ Database cleaned! All data removed.');
    console.log('Tables are still intact with their schemas.\n');
    
    // Verify
    const verify = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`Verification - Users count: ${verify.rows[0].count}`);
    
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
