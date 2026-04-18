const pool = require('./db.js');

(async () => {
  try {
    const result = await pool.query('SELECT * FROM digital_assets WHERE user_id = 5 ORDER BY asset_id');
    console.log('Assets for User 5 (test@gmail.com):');
    console.log('Total count:', result.rows.length);
    result.rows.forEach(row => {
      console.log(`- Asset ${row.asset_id}: ${row.platform_name} (${row.category})`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
