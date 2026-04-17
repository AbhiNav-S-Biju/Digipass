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
        message: 'Invalid executor credentials'
      });
    }

    const executor = rows[0];
    const isValidPassword = executor.executor_password_hash
      ? await comparePassword(password, executor.executor_password_hash)
      : false;

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid executor credentials'
      });
    }

    if (executor.verification_status !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Executor email is not verified yet'
      });
    }

    if (executor.access_granted !== true) {
      return res.status(403).json({
        success: false,
        message: 'Executor is verified, but access has not been granted yet'
      });
    }

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
          relationship: executor.relationship
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

    const [ownerResult, assetsResult] = await Promise.all([
      pool.query(
        `SELECT user_id, full_name, email
         FROM users
         WHERE user_id = $1`,
        [ownerUserId]
      ),
      pool.query(
        `SELECT asset_id, asset_name, asset_type, created_at
         FROM digital_assets
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [ownerUserId]
      )
    ]);

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset owner not found'
      });
    }

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
        count: assetsResult.rows.length,
        assets: assetsResult.rows
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
