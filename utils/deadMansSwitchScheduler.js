const cron = require('node-cron');
const pool = require('../db');

const DEFAULT_CHECK_INTERVAL_DAYS = 30;
const SCHEDULE_EXPRESSION = '0 0 * * *';

async function ensureDeadMansSwitchRows() {
  await pool.query(`
    INSERT INTO dead_mans_switch (user_id, check_interval_days, last_checkin, status, created_at, updated_at)
    SELECT
      u.user_id,
      $1,
      COALESCE(u.last_active, CURRENT_TIMESTAMP),
      'active',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    FROM users u
    WHERE NOT EXISTS (
      SELECT 1
      FROM dead_mans_switch dms
      WHERE dms.user_id = u.user_id
    )
  `, [DEFAULT_CHECK_INTERVAL_DAYS]);
}

async function processDeadMansSwitch() {
  try {
    await ensureDeadMansSwitchRows();

    const { rows } = await pool.query(`
      SELECT
        u.user_id,
        u.last_active,
        dms.dms_id,
        COALESCE(dms.check_interval_days, $1) AS check_interval_days,
        COALESCE(dms.status, 'active') AS status
      FROM users u
      INNER JOIN dead_mans_switch dms
        ON dms.user_id = u.user_id
    `, [DEFAULT_CHECK_INTERVAL_DAYS]);

    let triggeredUsers = 0;

    for (const row of rows) {
      const lastActive = row.last_active ? new Date(row.last_active) : null;
      const now = Date.now();
      const thresholdMs = row.check_interval_days * 24 * 60 * 60 * 1000;
      const isInactive = !lastActive || (now - lastActive.getTime()) >= thresholdMs;

      if (!isInactive) {
        await pool.query(`
          UPDATE dead_mans_switch
          SET
            status = 'active',
            last_checkin = COALESCE($2, last_checkin),
            updated_at = CURRENT_TIMESTAMP
          WHERE dms_id = $1
        `, [row.dms_id, row.last_active]);
        continue;
      }

      if (row.status !== 'triggered') {
        triggeredUsers += 1;
      }

      await pool.query(`
        UPDATE dead_mans_switch
        SET
          status = 'triggered',
          updated_at = CURRENT_TIMESTAMP
        WHERE dms_id = $1
      `, [row.dms_id]);

      await pool.query(`
        UPDATE executors
        SET
          access_granted = TRUE,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [row.user_id]);
    }

    console.log(`[DeadMansSwitch] Daily check completed. Users triggered: ${triggeredUsers}`);
  } catch (error) {
    console.error('[DeadMansSwitch] Job failed:', error);
  }
}

function startDeadMansSwitchScheduler() {
  console.log(`[DeadMansSwitch] Scheduler started with cron "${SCHEDULE_EXPRESSION}"`);

  cron.schedule(SCHEDULE_EXPRESSION, () => {
    processDeadMansSwitch().catch(err => {
      console.error('[DeadMansSwitch] Error processing dead mans switch:', err.message);
    });
  });
}

module.exports = {
  DEFAULT_CHECK_INTERVAL_DAYS,
  SCHEDULE_EXPRESSION,
  processDeadMansSwitch,
  startDeadMansSwitchScheduler
};
