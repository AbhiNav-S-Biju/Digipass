#!/usr/bin/env node

/**
 * Production Database Migration Script
 * Adds structured columns to digital_assets table
 * Run this on production to update schema
 */

const pool = require('./db');

async function migrateDigitalAssetsSchema() {
  console.log('Starting digital assets schema migration...\n');

  try {
    console.log('Step 1: Adding new columns to digital_assets table...');
    await pool.query(`
      ALTER TABLE digital_assets
      ADD COLUMN IF NOT EXISTS platform_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS category VARCHAR(50),
      ADD COLUMN IF NOT EXISTS account_identifier VARCHAR(255),
      ADD COLUMN IF NOT EXISTS action_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS last_message TEXT
    `);
    console.log('✓ Columns added successfully');

    console.log('\nStep 2: Creating index on platform_name...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_digital_assets_platform 
      ON digital_assets(platform_name)
    `);
    console.log('✓ Index created');

    console.log('\nStep 3: Creating index on category...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_digital_assets_category 
      ON digital_assets(category)
    `);
    console.log('✓ Index created');

    console.log('\nStep 4: Creating index on action_type...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_digital_assets_action 
      ON digital_assets(action_type)
    `);
    console.log('✓ Index created');

    console.log('\n✅ Schema migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

migrateDigitalAssetsSchema();
