require('dotenv').config();
const pool = require('./database');

const createTables = async () => {
  try {
    console.log('Creating tables...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Digital Assets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS digital_assets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        asset_type VARCHAR(100) NOT NULL,
        asset_name VARCHAR(255) NOT NULL,
        description TEXT,
        username VARCHAR(255),
        email VARCHAR(255),
        password_encrypted VARCHAR(255),
        recovery_email VARCHAR(255),
        two_factor_method VARCHAR(100),
        access_instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Digital Assets table created');

    // Executors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS executors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        executor_name VARCHAR(255) NOT NULL,
        executor_email VARCHAR(255) NOT NULL,
        executor_phone VARCHAR(20),
        relationship VARCHAR(100),
        percentage_share INTEGER,
        notification_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Executors table created');

    // Digital Wills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS digital_wills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        pdf_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Digital Wills table created');

    // Dead Man's Switch table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dead_mans_switch (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_check_in TIMESTAMP,
        check_in_interval_days INTEGER DEFAULT 30,
        is_triggered BOOLEAN DEFAULT FALSE,
        triggered_at TIMESTAMP,
        notification_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Dead Man\'s Switch table created');

    console.log('\n✅ All tables created successfully!');
    await pool.end();
  } catch (err) {
    console.error('Error creating tables:', err);
    await pool.end();
    process.exit(1);
  }
};

createTables();
