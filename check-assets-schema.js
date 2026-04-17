const pool = require('./db');

pool.query(`
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'digital_assets'
  ORDER BY ordinal_position
`, (err, res) => {
  if (err) {
    console.log('ERROR:', err.message);
  } else {
    if (res.rows.length === 0) {
      console.log('digital_assets table does not exist');
    } else {
      console.log('Digital Assets table columns:');
      res.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    }
  }
  pool.end();
});
