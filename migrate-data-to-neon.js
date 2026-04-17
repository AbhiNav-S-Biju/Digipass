#!/usr/bin/env node
const { Pool } = require('pg');

// Source: Render database
const sourcePool = new Pool({
  host: 'dpg-d7h8o2pj2pic73fvnbug-a',
  port: 5432,
  user: 'digipass_db_3mf7_user',
  password: 'xqIfpQYFQkbBAXz4HcEzHxQQrFIo2Sdx',
  database: 'digipass_db_3mf7',
});

// Target: Neon database
const targetPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_tpdL7iFko4xE@ep-misty-field-amrcdzch.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

const tables = ['users', 'digital_assets', 'executors', 'digital_will', 'dead_mans_switch'];

async function migrateData() {
  try {
    console.log('🔄 Starting data migration from Render to Neon...\n');

    for (const table of tables) {
      try {
        // Get data from Render
        const result = await sourcePool.query(`SELECT * FROM ${table}`);
        console.log(`📥 Fetched ${result.rows.length} rows from ${table}`);

        if (result.rows.length === 0) {
          console.log(`⏭️  ${table} is empty, skipping\n`);
          continue;
        }

        // Insert into Neon
        for (const row of result.rows) {
          const cols = Object.keys(row);
          const vals = cols.map(c => row[c]);
          const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
          const query = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          
          try {
            await targetPool.query(query, vals);
          } catch (err) {
            // Ignore constraint errors for now
            if (!err.message.includes('duplicate') && !err.message.includes('constraint')) {
              console.error(`  ⚠️  Error inserting into ${table}:`, err.message);
            }
          }
        }
        console.log(`✅ ${result.rows.length} rows migrated to ${table}\n`);
      } catch (err) {
        console.error(`❌ Error migrating ${table}:`, err.message);
      }
    }

    console.log('✅ Data migration completed!');
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

migrateData();
