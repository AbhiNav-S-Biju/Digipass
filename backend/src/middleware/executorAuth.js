const { verifyToken } = require('../utils/jwt');
const pool = require('../../config/database');

const authenticateExecutor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('[Executor Auth] Token present:', !!token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Executor token required'
      });
    }

    const decoded = verifyToken(token);
    
    console.log('[Executor Auth] Token decoded, type:', decoded?.type);

    if (!decoded || decoded.type !== 'executor') {
      return res.status(403).json({
        success: false,
        message: 'Invalid executor token'
      });
    }

    // Verify executor exists in database
    const { rows } = await pool.query(
      `SELECT
        executor_id,
        user_id,
        executor_name,
        executor_email,
        verification_status,
        access_granted
      FROM executors
      WHERE executor_id = $1 AND user_id = $2`,
      [decoded.executorId, decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Executor account not found'
      });
    }

    const executor = rows[0];

    if (executor.verification_status !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Executor email is not verified'
      });
    }

    if (executor.access_granted !== true) {
      return res.status(403).json({
        success: false,
        message: 'Executor access has not been granted'
      });
    }

    // Set request properties
    req.executor = executor;
    req.executorId = executor.executor_id;
    req.userId = executor.user_id; // Owner's user_id
    req.ownerUserId = executor.user_id;
    
    next();
  } catch (error) {
    console.error('[Executor Auth] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate executor'
    });
  }
};

module.exports = { authenticateExecutor };
