const pool = require('../db');
const { DEFAULT_CHECK_INTERVAL_DAYS } = require('../utils/deadMansSwitchScheduler');

/**
 * Get dead man's switch status for logged-in user
 * GET /api/dead-mans-switch/status
 */
const getStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { rows } = await pool.query(
      `SELECT 
        dms_id,
        check_interval_days,
        last_checkin,
        status,
        created_at,
        updated_at
       FROM dead_mans_switch
       WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dead man switch not initialized'
      });
    }

    const dms = rows[0];
    
    // Calculate days since last check-in
    const lastCheckin = new Date(dms.last_checkin);
    const now = new Date();
    const daysSinceCheckin = Math.floor((now - lastCheckin) / (1000 * 60 * 60 * 24));
    const daysUntilTrigger = Math.max(0, dms.check_interval_days - daysSinceCheckin);

    return res.status(200).json({
      success: true,
      data: {
        dms_id: dms.dms_id,
        check_interval_days: dms.check_interval_days,
        last_checkin: dms.last_checkin,
        status: dms.status,
        daysSinceCheckin,
        daysUntilTrigger,
        created_at: dms.created_at,
        updated_at: dms.updated_at
      }
    });
  } catch (error) {
    console.error('[DeadMansSwitch] Error getting status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dead man switch status'
    });
  }
};

/**
 * Manual check-in for dead man's switch
 * POST /api/dead-mans-switch/check-in
 */
const checkIn = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Update the check-in timestamp and reset status to active
    const { rows } = await pool.query(
      `UPDATE dead_mans_switch
       SET last_checkin = CURRENT_TIMESTAMP, 
           status = 'active',
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING dms_id, check_interval_days, last_checkin, status`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dead man switch not found'
      });
    }

    const dms = rows[0];

    // Also update user's last_active timestamp
    await pool.query(
      'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: {
        last_checkin: dms.last_checkin,
        status: dms.status,
        check_interval_days: dms.check_interval_days,
        nextCheckInDue: new Date(new Date(dms.last_checkin).getTime() + dms.check_interval_days * 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error('[DeadMansSwitch] Error during check-in:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process check-in'
    });
  }
};

/**
 * Update check interval for dead man's switch
 * PUT /api/dead-mans-switch/interval
 */
const updateInterval = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { check_interval_days } = req.body;

    // Validate input
    if (!check_interval_days || check_interval_days < 7 || check_interval_days > 365) {
      return res.status(400).json({
        success: false,
        message: 'Check interval must be between 7 and 365 days'
      });
    }

    const { rows } = await pool.query(
      `UPDATE dead_mans_switch
       SET check_interval_days = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING dms_id, check_interval_days, last_checkin, status`,
      [check_interval_days, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dead man switch not found'
      });
    }

    const dms = rows[0];
    const nextCheckInDue = new Date(new Date(dms.last_checkin).getTime() + check_interval_days * 24 * 60 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message: 'Check interval updated successfully',
      data: {
        check_interval_days: dms.check_interval_days,
        last_checkin: dms.last_checkin,
        status: dms.status,
        nextCheckInDue
      }
    });
  } catch (error) {
    console.error('[DeadMansSwitch] Error updating interval:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update check interval'
    });
  }
};

/**
 * Get executor notifications triggered by dead man's switch
 * GET /api/dead-mans-switch/executor-notifications
 */
const getExecutorNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { rows } = await pool.query(
      `SELECT 
        e.executor_id,
        e.executor_email,
        e.full_name,
        e.access_granted,
        e.created_at,
        dms.status,
        dms.last_checkin,
        u.full_name as owner_name,
        u.email as owner_email
       FROM executors e
       INNER JOIN users u ON e.user_id = u.user_id
       LEFT JOIN dead_mans_switch dms ON dms.user_id = u.user_id
       WHERE u.user_id = $1
       ORDER BY e.created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        executors: rows,
        count: rows.length,
        switchStatus: rows.length > 0 ? rows[0].status : null
      }
    });
  } catch (error) {
    console.error('[DeadMansSwitch] Error getting executor notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch executor notifications'
    });
  }
};

module.exports = {
  getStatus,
  checkIn,
  updateInterval,
  getExecutorNotifications
};
