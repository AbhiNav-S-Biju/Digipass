// Test database connection - run this locally to verify credentials
require('dotenv').config({ path: '.env.production' });

const { Pool } = require('pg');

console.log('🔍 Testing Database Connection...\n');
console.log('Credentials being used:');
console.log(`  Host: ${process.env.DB_HOST || process.env.PGHOST}`);
console.log(`  Port: ${process.env.DB_PORT || process.env.PGPORT}`);
console.log(`  User: ${process.env.DB_USER || process.env.PGUSER}`);
console.log(`  Database: ${process.env.DB_NAME || process.env.PGDATABASE}`);
console.log('');

const pool = new Pool({
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  database: process.env.DB_NAME || process.env.PGDATABASE || 'railway',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  connectionTimeoutMillis: 5000,
  query_timeout: 5000,
});

pool.query('SELECT NOW();', (err, res) => {
  if (err) {
    console.error('❌ Connection FAILED!');
    console.error('Error:', err.message);
    console.error('\nPossible causes:');
    console.error('  1. Database host/port is incorrect');
    console.error('  2. Database username/password is wrong');
    console.error('  3. Database is not running or not accessible');
    console.error('  4. Firewall is blocking the connection');
    process.exit(1);
  } else {
    console.log('✅ Connection SUCCESS!');
    console.log(`Database time: ${res.rows[0].now}`);
    
    // Try a simple SELECT from users table
    pool.query('SELECT COUNT(*) FROM users;', (err, res) => {
      if (err) {
        console.log('⚠️  Warning: Could not query users table');
        console.log('   Error:', err.message);
      } else {
        console.log(`✅ Users table exists: ${res.rows[0].count} users`);
      }
      process.exit(0);
    });
  }
});
