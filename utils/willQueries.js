const pool = require('../db');

/**
 * Get user with all their digital assets
 */
async function getUserWithAssets(userId) {
  try {
    const userResult = await pool.query(
      `SELECT user_id as id, full_name, email, created_at
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Get assets
    const assetsResult = await pool.query(
      `SELECT asset_id, platform_name as name, category, account_identifier, action_type as preferred_action, last_message as final_message, created_at
       FROM digital_assets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    user.assets = assetsResult.rows;
    return user;
  } catch (error) {
    console.error('Error fetching user with assets:', error);
    throw error;
  }
}

/**
 * Get all executors for a user
 */
async function getExecutorsByUserId(userId) {
  try {
    const result = await pool.query(
      `SELECT 
        executor_id,
        executor_name as full_name,
        executor_email as email,
        relationship,
        verification_status,
        access_granted,
        created_at
       FROM executors
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching executors:', error);
    throw error;
  }
}

/**
 * Get emergency contacts for a user
 */
async function getEmergencyContactsByUserId(userId) {
  try {
    const result = await pool.query(
      `SELECT 
        contact_id,
        contact_name as name,
        contact_role as role,
        contact_email as email,
        contact_phone as phone_number
       FROM emergency_contacts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    throw error;
  }
}

module.exports = {
  getUserWithAssets,
  getExecutorsByUserId,
  getEmergencyContactsByUserId
};
