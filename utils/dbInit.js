const pool = require('../db');

/**
 * Initialize users table
 */
const initializeUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    console.log('✓ Users table initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing users table:', err.message);
    return false;
  }
};

/**
 * Initialize digital assets table
 */
const initializeDigitalAssetsTable = async () => {
  try {
    const result = await pool.query(`
      CREATE TABLE IF NOT EXISTS digital_assets (
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
    
    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id 
      ON digital_assets(user_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_digital_assets_created_at 
      ON digital_assets(created_at DESC)
    `);
    
    console.log('✓ Digital assets table initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing digital assets table:', err.message);
    return false;
  }
};

const initializeUserActivityColumns = async () => {
  try {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
    `);

    await pool.query(`
      UPDATE users
      SET
        last_active = COALESCE(last_active, created_at, CURRENT_TIMESTAMP),
        is_active = COALESCE(is_active, TRUE)
    `);

    console.log('✓ User activity columns initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing user activity columns:', err.message);
    return false;
  }
};

const initializeExecutorsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS executors (
        executor_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        executor_name VARCHAR(255) NOT NULL,
        executor_email VARCHAR(255) NOT NULL,
        executor_phone VARCHAR(20),
        relationship VARCHAR(100),
        verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        access_granted BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      ALTER TABLE executors
      ADD COLUMN IF NOT EXISTS executor_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS executor_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS executor_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS relationship VARCHAR(100),
      ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS access_granted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS executor_password_hash TEXT,
      ADD COLUMN IF NOT EXISTS verification_token_hash TEXT,
      ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'executors' AND column_name = 'full_name'
        ) THEN
          EXECUTE '
            UPDATE executors
            SET executor_name = COALESCE(executor_name, full_name)
            WHERE executor_name IS NULL
          ';
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'executors' AND column_name = 'email'
        ) THEN
          EXECUTE '
            UPDATE executors
            SET executor_email = COALESCE(executor_email, email)
            WHERE executor_email IS NULL
          ';
        END IF;
      END $$;
    `);

    await pool.query(`
      UPDATE executors
      SET
        verification_status = COALESCE(verification_status, 'pending'),
        access_granted = COALESCE(access_granted, FALSE),
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
    `);

    await pool.query(`
      ALTER TABLE executors
      ALTER COLUMN executor_name SET NOT NULL,
      ALTER COLUMN executor_email SET NOT NULL,
      ALTER COLUMN verification_status SET NOT NULL,
      ALTER COLUMN access_granted SET NOT NULL
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_executors_user_id
      ON executors(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_executors_created_at
      ON executors(created_at DESC)
    `);

    console.log('✓ Executors table initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing executors table:', err.message);
    return false;
  }
};

const initializeDeadMansSwitchTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dead_mans_switch (
        dms_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        check_interval_days INTEGER NOT NULL DEFAULT 30,
        last_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      ALTER TABLE dead_mans_switch
      ADD COLUMN IF NOT EXISTS check_interval_days INTEGER DEFAULT 30,
      ADD COLUMN IF NOT EXISTS last_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await pool.query(`
      UPDATE dead_mans_switch
      SET
        check_interval_days = COALESCE(check_interval_days, 30),
        last_checkin = COALESCE(last_checkin, CURRENT_TIMESTAMP),
        status = COALESCE(status, 'active'),
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
    `);

    await pool.query(`
      ALTER TABLE dead_mans_switch
      ALTER COLUMN check_interval_days SET NOT NULL,
      ALTER COLUMN status SET NOT NULL
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_dead_mans_switch_user_id
      ON dead_mans_switch(user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_dead_mans_switch_status
      ON dead_mans_switch(status)
    `);

    await pool.query(`
      INSERT INTO dead_mans_switch (user_id, check_interval_days, last_checkin, status, created_at, updated_at)
      SELECT
        u.user_id,
        30,
        COALESCE(u.last_active, CURRENT_TIMESTAMP),
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1
        FROM dead_mans_switch dms
        WHERE dms.user_id = u.user_id
      )
    `);

    console.log('✓ Dead man\'s switch table initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing dead man\'s switch table:', err.message);
    return false;
  }
};

const initializeDigitalWillTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS digital_will (
        will_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_digital_will_user_id
      ON digital_will(user_id)
    `);

    console.log('✓ Digital will table initialized successfully');
    return true;
  } catch (err) {
    console.error('Error initializing digital will table:', err.message);
    return false;
  }
};

module.exports = {
  initializeUsersTable,
  initializeUserActivityColumns,
  initializeDigitalAssetsTable,
  initializeExecutorsTable,
  initializeDeadMansSwitchTable,
  initializeDigitalWillTable
};
