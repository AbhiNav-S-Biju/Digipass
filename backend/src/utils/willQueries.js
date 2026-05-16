/**
 * Database queries for Digital Will generation
 * Fetches user, assets, executors, and emergency contacts data
 */

const pool = require('../../config/database');

/**
 * Get user with all their digital assets
 */
async function getUserWithAssets(userId) {
  try {
    const userQuery = `
      SELECT 
        id,
        full_name,
        email,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `;

    const userResult = await pool.query(userQuery, [userId]);
    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Fetch assets for this user
    const assetsQuery = `
      SELECT 
        id,
        name,
        category,
        description,
        preferred_action,
        final_message,
        created_at,
        updated_at
      FROM digital_assets
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const assetsResult = await pool.query(assetsQuery, [userId]);
    
    return {
      ...user,
      assets: assetsResult.rows || []
    };

  } catch (error) {
    console.error('Error in getUserWithAssets:', error);
    throw error;
  }
}

/**
 * Get all executors assigned to a user
 */
async function getExecutorsByUserId(userId) {
  try {
    const query = `
      SELECT 
        e.id,
        e.full_name,
        e.email,
        e.phone_number,
        e.relationship,
        e.verification_status,
        e.access_granted,
        e.created_at,
        e.updated_at
      FROM executors e
      WHERE e.user_id = $1
      ORDER BY e.created_at ASC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows || [];

  } catch (error) {
    console.error('Error in getExecutorsByUserId:', error);
    throw error;
  }
}

/**
 * Get all emergency contacts for a user
 */
async function getEmergencyContactsByUserId(userId) {
  try {
    const query = `
      SELECT 
        id,
        name,
        role,
        email,
        phone_number,
        notes,
        created_at
      FROM emergency_contacts
      WHERE user_id = $1
      ORDER BY created_at ASC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows || [];

  } catch (error) {
    console.error('Error in getEmergencyContactsByUserId:', error);
    throw error;
  }
}

/**
 * Get specific executor assignments for an asset
 * Useful if implementing per-asset executor mapping
 */
async function getExecutorAssignmentsForAsset(assetId) {
  try {
    const query = `
      SELECT 
        ea.asset_id,
        ea.executor_id,
        ea.assigned_date,
        e.full_name,
        e.email
      FROM executor_assets ea
      JOIN executors e ON ea.executor_id = e.id
      WHERE ea.asset_id = $1
      ORDER BY ea.assigned_date ASC
    `;

    const result = await pool.query(query, [assetId]);
    return result.rows || [];

  } catch (error) {
    console.error('Error in getExecutorAssignmentsForAsset:', error);
    throw error;
  }
}

/**
 * Verify user owns the asset (for security)
 */
async function verifyUserOwnsAsset(userId, assetId) {
  try {
    const query = `
      SELECT id FROM digital_assets
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [assetId, userId]);
    return result.rows.length > 0;

  } catch (error) {
    console.error('Error in verifyUserOwnsAsset:', error);
    throw error;
  }
}

/**
 * Get will generation history for a user (optional enhancement)
 */
async function getWillGenerationHistory(userId, limit = 10) {
  try {
    const query = `
      SELECT 
        id,
        user_id,
        generated_at,
        file_path,
        status
      FROM will_generations
      WHERE user_id = $1
      ORDER BY generated_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows || [];

  } catch (error) {
    console.error('Error in getWillGenerationHistory:', error);
    throw error;
  }
}

module.exports = {
  getUserWithAssets,
  getExecutorsByUserId,
  getEmergencyContactsByUserId,
  getExecutorAssignmentsForAsset,
  verifyUserOwnsAsset,
  getWillGenerationHistory
};
