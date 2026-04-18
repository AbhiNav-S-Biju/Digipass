const pool = require('./db.js');

(async () => {
  try {
    // Add password column if it doesn't exist
    const result = await pool.query(`
      ALTER TABLE digital_assets
      ADD COLUMN IF NOT EXISTS account_password VARCHAR(500);
    `);
    
    console.log('✓ Added account_password column to digital_assets table');
    
    // Verify the column exists
    const columns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'digital_assets' AND column_name = 'account_password'
    `);
    
    if (columns.rows.length > 0) {
      console.log('✓ Column verified in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
