const pool = require('./db');

async function recreateAssetsTable() {
  try {
    console.log('Dropping existing digital_assets table...');
    await pool.query('DROP TABLE IF EXISTS digital_assets CASCADE');
    console.log('✓ Table dropped');
    
    console.log('\nCreating new digital_assets table...');
    await pool.query(`
      CREATE TABLE digital_assets (
        asset_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        asset_name VARCHAR(255) NOT NULL,
        asset_type VARCHAR(50) NOT NULL,
        encrypted_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Table created');
    
    console.log('\nCreating indexes...');
    await pool.query(`
      CREATE INDEX idx_digital_assets_user_id ON digital_assets(user_id)
    `);
    await pool.query(`
      CREATE INDEX idx_digital_assets_created_at ON digital_assets(created_at DESC)
    `);
    console.log('✓ Indexes created');
    
    console.log('\n✅ Digital assets table recreated successfully!');
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

recreateAssetsTable();
