const pool = require('../db');
const { generateExecutorToken } = require('../utils/jwt');
const { comparePassword, hashPassword } = require('../utils/bcrypt');
const { hashVerificationToken } = require('../utils/executorVerification');

async function executorLogin(req, res) {
  try {
    const { executor_email, password } = req.body;

    if (!executor_email || !password) {
      return res.status(400).json({
        success: false,
        message: 'executor_email and password are required'
      });
    }

    const { rows } = await pool.query(
      `SELECT
        executor_id,
        user_id,
        executor_name,
        executor_email,
        executor_phone,
        relationship,
        executor_password_hash,
        verification_status,
        access_granted
      FROM executors
      WHERE LOWER(executor_email) = LOWER($1)`,
      [executor_email.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'No executor account found with this email. Ask your administrator to add you and share the QR code for setup.'
      });
    }

    const executor = rows[0];
    
    // Check if password has been set yet
    if (!executor.executor_password_hash) {
      console.log(`[Executor Login] No password set for executor ${executor.executor_email}`);
      return res.status(401).json({
        success: false,
        message: 'Your account is not yet activated. Ask your administrator to share the QR code or verification link to set up your password.'
      });
    }
    
    const isValidPassword = await comparePassword(password, executor.executor_password_hash);

    if (!isValidPassword) {
      console.log(`[Executor Login] Invalid password for executor ${executor.executor_email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (executor.verification_status !== 'verified') {
      console.log(`[Executor Login] Verification failed for executor ${executor.executor_id}: status is '${executor.verification_status}'`);
      return res.status(403).json({
        success: false,
        message: 'Your account verification is pending. Scan the QR code your administrator shared or ask them to resend the verification link.'
      });
    }

    if (executor.access_granted !== true) {
      console.log(`[Executor Login] Access not granted for executor ${executor.executor_id}`);
      return res.status(403).json({
        success: false,
        message: 'Your administrator has not granted you access yet. Please ask them to grant access.'
      });
    }

    // Fetch owner info to display in executor portal
    const { rows: ownerRows } = await pool.query(
      'SELECT full_name FROM users WHERE user_id = $1',
      [executor.user_id]
    );
    const ownerName = ownerRows.length > 0 ? ownerRows[0].full_name : 'Estate Owner';

    const token = generateExecutorToken(executor);

    return res.status(200).json({
      success: true,
      message: 'Executor login successful',
      data: {
        token,
        executor: {
          executor_id: executor.executor_id,
          executor_name: executor.executor_name,
          executor_email: executor.executor_email,
          executor_phone: executor.executor_phone,
          relationship: executor.relationship,
          ownerName: ownerName
        }
      }
    });
  } catch (error) {
    console.error('Executor Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to login executor'
    });
  }
}

async function registerExecutor(req, res) {
  try {
    const { token, password, confirm_password } = req.body;

    if (!token || !password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'token, password, and confirm_password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const tokenHash = hashVerificationToken(token);
    const { rows } = await pool.query(
      `SELECT
        executor_id,
        executor_name,
        executor_email,
        verification_token_expires_at
      FROM executors
      WHERE verification_token_hash = $1
        AND verification_token_expires_at IS NOT NULL
        AND verification_token_expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Registration link is invalid or has expired'
      });
    }

    const executor = rows[0];
    const passwordHash = await hashPassword(password);

    await pool.query(
      `UPDATE executors
       SET
         executor_password_hash = $1,
         verification_status = 'verified',
         verification_token_hash = NULL,
         verification_token_expires_at = NULL,
         updated_at = CURRENT_TIMESTAMP
       WHERE executor_id = $2`,
      [passwordHash, executor.executor_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Executor registered successfully. Access will be available once it is granted.',
      data: {
        executor_id: executor.executor_id,
        executor_name: executor.executor_name,
        executor_email: executor.executor_email
      }
    });
  } catch (error) {
    console.error('Executor Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register executor'
    });
  }
}

async function getExecutorAssets(req, res) {
  try {
    const { ownerUserId, executor } = req;

    console.log(`[Executor Assets] Fetching assets for owner user_id: ${ownerUserId}, executor_id: ${executor.executor_id}`);

    const [ownerResult, assetsResult] = await Promise.all([
      pool.query(
        `SELECT user_id, full_name, email
         FROM users
         WHERE user_id = $1`,
        [ownerUserId]
      ),
      // Query with COALESCE to handle both old and new schemas
      pool.query(
        `SELECT 
          asset_id,
          COALESCE(platform_name, asset_name) as platform_name,
          COALESCE(category, asset_type) as category,
          account_identifier,
          action_type,
          last_message,
          encrypted_data,
          created_at
         FROM digital_assets
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [ownerUserId]
      )
    ]);

    console.log(`[Executor Assets] Owner found: ${ownerResult.rows.length > 0}, Assets found: ${assetsResult.rows.length}`);

    if (ownerResult.rows.length === 0) {
      console.log(`[Executor Assets] Owner user_id ${ownerUserId} not found in database`);
      return res.status(404).json({
        success: false,
        message: 'Asset owner not found'
      });
    }

    // Transform assets to ensure consistency
    const transformedAssets = assetsResult.rows
      .map(asset => {
        // Handle both old and new schema
        let accountIdentifier = asset.account_identifier;
        let actionType = asset.action_type;
        let lastMessage = asset.last_message;

        // If using old schema, parse encrypted_data to extract account info
        if (!accountIdentifier && asset.encrypted_data) {
          try {
            const decrypted = JSON.parse(asset.encrypted_data);
            accountIdentifier = decrypted.account || null;
            actionType = decrypted.action || null;
            lastMessage = decrypted.message || null;
          } catch (e) {
            console.warn(`[Executor Assets] Failed to parse encrypted_data for asset ${asset.asset_id}`);
          }
        }

        return {
          asset_id: asset.asset_id,
          platform_name: asset.platform_name,
          category: asset.category,
          account_identifier: accountIdentifier,
          action_type: actionType,
          last_message: lastMessage,
          created_at: asset.created_at
        };
      })
      .filter(asset => asset.platform_name !== null && asset.platform_name !== undefined);

    console.log(`[Executor Assets] Transformed ${transformedAssets.length} assets (filtered nulls)`);

    return res.status(200).json({
      success: true,
      message: 'Executor assets retrieved successfully',
      data: {
        owner: ownerResult.rows[0],
        executor: {
          executor_id: executor.executor_id,
          executor_name: executor.executor_name,
          executor_email: executor.executor_email
        },
        count: transformedAssets.length,
        assets: transformedAssets
      }
    });
  } catch (error) {
    console.error('Executor Assets Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve executor assets'
    });
  }
}

module.exports = {
  executorLogin,
  registerExecutor,
  getExecutorAssets
};
