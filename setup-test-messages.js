#!/usr/bin/env node

const pool = require('./db');

async function testFinalMessages() {
  try {
    // Get first user with assets
    const userRes = await pool.query(`
      SELECT u.user_id, u.full_name, u.email
      FROM users u
      LIMIT 1
    `);

    if (userRes.rows.length === 0) {
      console.log('No users found in database. Please add a user first.');
      process.exit(0);
    }

    const user = userRes.rows[0];
    console.log(`Found user: ${user.full_name} (ID: ${user.user_id})`);

    // Check if they have assets
    const assetsRes = await pool.query(`
      SELECT asset_id, platform_name, last_message
      FROM digital_assets
      WHERE user_id = $1
      LIMIT 5
    `, [user.user_id]);

    console.log(`\n${assetsRes.rows.length} assets found:`);
    
    for (const asset of assetsRes.rows) {
      console.log(`  - ${asset.platform_name}: last_message = "${asset.last_message || '(empty)'}"`);
    }

    // Update first 3 assets with final messages
    if (assetsRes.rows.length > 0) {
      console.log('\nUpdating assets with final messages...');
      
      const messages = [
        'Please memorialize this account in my memory.',
        'Transfer all data to my family and delete the account.',
        'Archive this account for posterity.'
      ];

      for (let i = 0; i < Math.min(3, assetsRes.rows.length); i++) {
        const asset = assetsRes.rows[i];
        await pool.query(
          `UPDATE digital_assets
           SET last_message = $1, updated_at = NOW()
           WHERE asset_id = $2`,
          [messages[i], asset.asset_id]
        );
        console.log(`  ✓ Updated ${asset.platform_name} with message`);
      }

      console.log('\n✅ Test data updated. Generate a will from the user dashboard to see the messages in Article IV.');
    } else {
      console.log('\nNo assets found. Add some digital assets first to test final messages.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testFinalMessages();
