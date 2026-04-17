#!/usr/bin/env node
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use your Neon connection string
const neonConnectionString = process.env.NEON_CONNECTION_URL || 
  'postgresql://neondb_owner:npg_tpdL7iFko4xE@ep-misty-field-amrcdzch.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: neonConnectionString,
});

async function runMigrations() {
  const migrationDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql')).sort();

  console.log(`Found ${files.length} migration files`);

  for (const file of files) {
    try {
      console.log(`\n📝 Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
      
      await pool.query(sql);
      console.log(`✅ ${file} completed successfully`);
    } catch (error) {
      console.error(`❌ Error in ${file}:`, error.message);
    }
  }

  await pool.end();
  console.log('\n✅ All migrations completed!');
}

runMigrations().catch(console.error);
