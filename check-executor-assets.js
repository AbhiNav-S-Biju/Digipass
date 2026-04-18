const pool = require('./db.js');

(async () => {
  try {
    // Check what executors will see
    const execs = [
      { id: 7, owner_id: 3, name: 'AbhiTest' },
      { id: 8, owner_id: 4, name: 'Mentest' }
    ];
    
    for (const ex of execs) {
      console.log(`\n========================================`);
      console.log(`Executor ${ex.id} (${ex.name}) -> Owner User ${ex.owner_id}`);
      console.log(`========================================`);
      
      const assets = await pool.query(
        'SELECT * FROM digital_assets WHERE user_id = $1',
        [ex.owner_id]
      );
      
      console.log(`Assets found: ${assets.rows.length}`);
      if (assets.rows.length > 0) {
        console.table(assets.rows);
      } else {
        console.log('(No assets)');
      }
    }
    
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
