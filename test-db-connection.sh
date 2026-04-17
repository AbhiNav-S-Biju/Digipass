#!/bin/bash
# Test Railway PostgreSQL connection
# Add this to your Railway project root

echo "Testing PostgreSQL connection with Railway credentials..."
echo ""
echo "Environment variables:"
echo "  PGHOST: $PGHOST"
echo "  PGPORT: $PGPORT"
echo "  PGUSER: $PGUSER"
echo "  PGDATABASE: $PGDATABASE"
echo ""

# Test with psql if available, otherwise with node
if command -v psql &> /dev/null; then
  echo "Testing with psql..."
  psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT NOW();" 2>&1
else
  echo "Testing with Node.js..."
  node -e "
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.PGUSER || process.env.DB_USER,
      host: process.env.PGHOST || process.env.DB_HOST,
      database: process.env.PGDATABASE || process.env.DB_NAME,
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
      port: process.env.PGPORT || process.env.DB_PORT || 5432,
      connectionTimeoutMillis: 5000,
    });
    
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('❌ Connection FAILED:', err.message);
        process.exit(1);
      } else {
        console.log('✅ Connection SUCCESS:', res.rows[0]);
        process.exit(0);
      }
    });
  "
fi
