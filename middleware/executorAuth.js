const pool = require('../db');
const { verifyToken } = require('../utils/jwt');

async function authenticateExecutor(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Executor token required'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.type !== 'executor') {
      return res.status(403).json({
        success: false,
        message: 'Invalid executor token'
      });
    }

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
        message: 'Executor email is not verified yet'
      });
    }

    if (executor.access_granted !== true) {
      return res.status(403).json({
        success: false,
        message: 'Executor is verified, but access has not been granted yet'
      });
    }

    req.executor = executor;
    req.ownerUserId = executor.user_id;
    next();
  } catch (error) {
    console.error('Executor Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate executor'
    });
  }
}

module.exports = {
  authenticateExecutor
};
