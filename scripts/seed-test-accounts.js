#!/usr/bin/env node
/**
 * Seed a test owner account and a ready-to-use test executor.
 *
 *   node scripts/seed-test-accounts.js --yes
 *
 * Writes to the database configured in .env (DB_HOST etc.). For this project that
 * is the shared Neon database, so the accounts appear on the live site too.
 * Safe to re-run: existing test accounts are reused and their passwords rotated.
 *
 * Credentials are written to test-accounts.local.json (gitignored), never printed.
 * Uses the reserved .test domain, so no real mailbox can receive anything.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const pool = require('../db');
const { hashPassword } = require('../utils/bcrypt');

const OWNER_EMAIL = 'test.owner@digipass.test';
const EXECUTOR_EMAIL = 'test.executor@digipass.test';
const OUT_FILE = path.join(__dirname, '..', 'test-accounts.local.json');

const SAMPLE_ASSETS = [
  { platform_name: 'Gmail', category: 'email', account_identifier: 'test.owner.mail@example.test', action_type: 'pass', last_message: null },
  { platform_name: 'Google Drive', category: 'storage', account_identifier: 'test.owner.mail@example.test', action_type: 'pass', last_message: null },
  { platform_name: 'Netflix', category: 'entertainment', account_identifier: 'test.owner.mail@example.test', action_type: 'delete', last_message: null },
  { platform_name: 'Facebook', category: 'social', account_identifier: 'test.owner.fb', action_type: 'last_message', last_message: 'This is a test farewell message from the DIGIPASS test account.' }
];

function randomPassword() {
  // 16 chars from a URL-safe alphabet, plus a guaranteed digit and symbol
  return crypto.randomBytes(12).toString('base64url') + '7!';
}

async function main() {
  if (!process.argv.includes('--yes')) {
    console.log(`This creates/updates test accounts in the database at ${process.env.DB_HOST || 'localhost'}.`);
    console.log('Re-run with --yes to continue.');
    process.exit(1);
  }

  const ownerPassword = randomPassword();
  const executorPassword = randomPassword();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Owner
    const ownerHash = await hashPassword(ownerPassword);
    const { rows: ownerRows } = await client.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP
       RETURNING user_id`,
      ['Test Owner', OWNER_EMAIL, ownerHash]
    );
    const ownerId = ownerRows[0].user_id;

    // Sample assets (only if the test owner has none yet)
    const { rows: countRows } = await client.query('SELECT COUNT(*)::int AS n FROM digital_assets WHERE user_id = $1', [ownerId]);
    if (countRows[0].n === 0) {
      for (const a of SAMPLE_ASSETS) {
        await client.query(
          `INSERT INTO digital_assets (user_id, platform_name, category, account_identifier, account_password, action_type, last_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [ownerId, a.platform_name, a.category, a.account_identifier, 'test-only-not-a-real-password', a.action_type, a.last_message]
        );
      }
    }

    // Executor: verified, password set, access granted
    const executorHash = await hashPassword(executorPassword);
    const { rows: existing } = await client.query(
      'SELECT executor_id FROM executors WHERE user_id = $1 AND LOWER(executor_email) = LOWER($2)',
      [ownerId, EXECUTOR_EMAIL]
    );
    if (existing.length) {
      await client.query(
        `UPDATE executors
         SET executor_password_hash = $1, verification_status = 'verified', access_granted = true,
             verification_token_hash = NULL, verification_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE executor_id = $2`,
        [executorHash, existing[0].executor_id]
      );
    } else {
      await client.query(
        `INSERT INTO executors (user_id, executor_name, executor_email, relationship, verification_status, access_granted, executor_password_hash)
         VALUES ($1, $2, $3, $4, 'verified', true, $5)`,
        [ownerId, 'Test Executor', EXECUTOR_EMAIL, 'Test account', executorHash]
      );
    }

    await client.query('COMMIT');

    fs.writeFileSync(OUT_FILE, JSON.stringify({
      note: 'Test-only DIGIPASS accounts. Do not commit. Re-running the seed script rotates these passwords.',
      owner: { login_page: '/login.html', email: OWNER_EMAIL, password: ownerPassword },
      executor: { login_page: '/executor-login.html', email: EXECUTOR_EMAIL, password: executorPassword }
    }, null, 2));

    console.log(`Test owner and executor are ready. Credentials written to ${path.basename(OUT_FILE)} (gitignored).`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
