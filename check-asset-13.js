const pool = require('./db.js');

(async () => {
  try {
    const result = await pool.query('SELECT * FROM digital_assets WHERE asset_id = 13');
    console.log('Asset 13 details:');
    console.log(JSON.stringify(result.rows[0], null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
