const pool = require('../db');

/**
 * Log user activity
 * @param {number} userId - User ID
 * @param {string} actionType - Type of action (asset_created, executor_added, etc)
 * @param {string} description - Human-readable description
 * @param {string} entityType - Type of entity affected (asset, executor, will, etc)
 * @param {number} entityId - ID of affected entity
 * @returns {Promise<void>}
 */
const logActivity = async (userId, actionType, description, entityType = null, entityId = null) => {
  try {
    await pool.query(
      `INSERT INTO user_activity (user_id, action_type, description, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, actionType, description, entityType, entityId]
    );
  } catch (err) {
    console.error('Error logging activity:', err.message);
    // Don't throw - activity logging should not crash the app
  }
};

/**
 * Get user activities (recent first)
 * @param {number} userId - User ID
 * @param {number} limit - Number of activities to return (default 20)
 * @returns {Promise<Array>}
 */
const getUserActivities = async (userId, limit = 20) => {
  try {
    const result = await pool.query(
      `SELECT 
        activity_id,
        action_type,
        description,
        entity_type,
        entity_id,
        created_at
       FROM user_activity
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  } catch (err) {
    console.error('Error getting user activities:', err.message);
    return [];
  }
};

module.exports = {
  logActivity,
  getUserActivities
};
