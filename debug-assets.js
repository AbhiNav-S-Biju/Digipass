const pool = require('./db');

async function debugAssets() {
  try {
    console.log('\n===== ASSET DEBUG QUERY =====\n');

    // Check all assets
    const allAssets = await pool.query(`
      SELECT asset_id, user_id, platform_name, category, account_identifier, created_at
      FROM digital_assets
      ORDER BY user_id, created_at DESC
    `);

    console.log(`Total assets in database: ${allAssets.rows.length}`);
    console.log('\nAll assets:');
    console.log(JSON.stringify(allAssets.rows, null, 2));

    // Check assets for user_id 7
    const user7Assets = await pool.query(`
      SELECT asset_id, user_id, platform_name, category, account_identifier, created_at
      FROM digital_assets
      WHERE user_id = 7
    `);

    console.log(`\n\nAssets for user_id 7: ${user7Assets.rows.length}`);
    console.log(JSON.stringify(user7Assets.rows, null, 2));

    // Check user 7 info
    const user7 = await pool.query(`
      SELECT user_id, full_name, email
      FROM users
      WHERE user_id = 7
    `);

    console.log('\n\nUser 7 info:');
    console.log(JSON.stringify(user7.rows, null, 2));

    // Check executor 16 info
    const executor16 = await pool.query(`
      SELECT executor_id, user_id, executor_name, executor_email
      FROM executors
      WHERE executor_id = 16
    `);

    console.log('\n\nExecutor 16 info:');
    console.log(JSON.stringify(executor16.rows, null, 2));

    // Check all users with assets
    const usersWithAssets = await pool.query(`
      SELECT DISTINCT user_id, COUNT(*) as asset_count
      FROM digital_assets
      GROUP BY user_id
      ORDER BY user_id
    `);

    console.log('\n\nUsers with assets:');
    console.log(JSON.stringify(usersWithAssets.rows, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Debug Error:', error);
    process.exit(1);
  }
}

debugAssets();
