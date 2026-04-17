const pool = require('../db');
const {
  generateVerificationToken,
  hashVerificationToken,
  getVerificationExpiryDate
} = require('../utils/executorVerification');
const { getExecutorVerificationUrl, sendExecutorVerificationEmail } = require('../utils/mailer');

function buildExecutorResponse(executor) {
  return {
    executor_id: executor.executor_id,
    executor_name: executor.executor_name,
    executor_email: executor.executor_email,
    executor_phone: executor.executor_phone,
    relationship: executor.relationship,
    verification_status: executor.verification_status,
    access_granted: executor.access_granted,
    created_at: executor.created_at
  };
}

async function addExecutor(req, res) {
  try {
    const userId = req.userId;
    const {
      executor_name,
      executor_email,
      executor_phone = null,
      relationship = null
    } = req.body;

    if (!executor_name || !executor_email) {
      return res.status(400).json({
        success: false,
        message: 'executor_name and executor_email are required'
      });
    }

    console.log('[Executor Controller] addExecutor called');
    console.log(`  - userId: ${userId}`);
    console.log(`  - executor_name: ${executor_name}`);
    console.log(`  - executor_email: ${executor_email}`);

    const verificationToken = generateVerificationToken();
    const verificationTokenHash = hashVerificationToken(verificationToken);
    const verificationTokenExpiresAt = getVerificationExpiryDate();

    const { rows } = await pool.query(
      `INSERT INTO executors (
        user_id,
        executor_name,
        executor_email,
        executor_phone,
        relationship,
        verification_status,
        access_granted,
        verification_token_hash,
        verification_token_expires_at,
        verification_sent_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'pending', false, $6, $7, NOW(), NOW(), NOW())
      RETURNING
        executor_id,
        executor_name,
        executor_email,
        executor_phone,
        relationship,
        verification_status,
        access_granted,
        created_at`,
      [
        userId,
        executor_name.trim(),
        executor_email.trim().toLowerCase(),
        executor_phone,
        relationship,
        verificationTokenHash,
        verificationTokenExpiresAt
      ]
    );

    const executor = rows[0];
    console.log('[Executor Controller] Executor created in database');
    console.log(`  - executor_id: ${executor.executor_id}`);
    console.log(`  - verification link will be sent to: ${executor.executor_email}`);
    
    const fallbackVerificationUrl = getExecutorVerificationUrl(verificationToken);

    // Send email asynchronously (non-blocking)
    // If email fails, executor is still created - they can use the fallback URL
    console.log('[Executor Controller] Queuing email to send in background...');
    setImmediate(async () => {
      try {
        console.log('[Executor Controller] [Background] Calling sendExecutorVerificationEmail...');
        const delivery = await sendExecutorVerificationEmail({
          executorName: executor.executor_name,
          executorEmail: executor.executor_email,
          token: verificationToken
        });

        console.log('[Executor Controller] [Background] Email sent successfully');
        console.log(`  - delivered: ${delivery.delivered}`);
        console.log(`  - messageId: ${delivery.messageId || '(none)'}`);
      } catch (mailError) {
        // Email failed but executor was created successfully
        // This is not a critical error - the verification link is still valid
        console.warn('[Executor Controller] [Background] Email sending failed (non-critical)');
        console.warn(`  - executor_id: ${executor.executor_id}`);
        console.warn(`  - executor_email: ${executor.executor_email}`);
        console.warn(`  - message: ${mailError.message}`);
        console.warn(`  - code: ${mailError.code || '(none)'}`);
        console.warn(`  - fallback: verification URL is logged above and available via API response`);
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Executor added successfully. Verification email will be sent shortly.',
      data: {
        ...buildExecutorResponse(executor),
        verification_email_sent: 'pending',
        verification_preview_url: process.env.NODE_ENV === 'development' ? fallbackVerificationUrl : undefined
      }
    });
  } catch (error) {
    console.error('Add Executor Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add executor'
    });
  }
}

async function getExecutors(req, res) {
  try {
    const userId = req.userId;

    const { rows } = await pool.query(
      `SELECT
        executor_id,
        executor_name,
        executor_email,
        executor_phone,
        relationship,
        verification_status,
        access_granted,
        created_at
      FROM executors
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Executors retrieved successfully',
      count: rows.length,
      data: rows.map(buildExecutorResponse)
    });
  } catch (error) {
    console.error('Get Executors Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve executors'
    });
  }
}

async function resendExecutorVerification(req, res) {
  try {
    const userId = req.userId;
    const executorId = Number.parseInt(req.params.id, 10);

    console.log('[Executor Controller] resendExecutorVerification called');
    console.log(`  - userId: ${userId}`);
    console.log(`  - executorId: ${executorId}`);

    if (!Number.isInteger(executorId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid executor id is required'
      });
    }

    const { rows } = await pool.query(
      `SELECT
        executor_id,
        executor_name,
        executor_email,
        verification_status
      FROM executors
      WHERE executor_id = $1 AND user_id = $2`,
      [executorId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Executor not found'
      });
    }

    const executor = rows[0];

    if (executor.verification_status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Executor is already verified'
      });
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenHash = hashVerificationToken(verificationToken);
    const verificationTokenExpiresAt = getVerificationExpiryDate();

    await pool.query(
      `UPDATE executors
       SET
         verification_token_hash = $1,
         verification_token_expires_at = $2,
         verification_sent_at = NOW(),
         updated_at = CURRENT_TIMESTAMP
       WHERE executor_id = $3`,
      [verificationTokenHash, verificationTokenExpiresAt, executorId]
    );
    
    const fallbackVerificationUrl = getExecutorVerificationUrl(verificationToken);

    // Send email asynchronously (non-blocking)
    // If email fails, executor token is still updated - they can still use the link
    console.log('[Executor Controller] Queuing resend verification email to send in background...');
    setImmediate(async () => {
      try {
        console.log('[Executor Controller] [Background] Calling sendExecutorVerificationEmail...');
        const delivery = await sendExecutorVerificationEmail({
          executorName: executor.executor_name,
          executorEmail: executor.executor_email,
          token: verificationToken
        });

        console.log('[Executor Controller] [Background] Resend email sent successfully');
        console.log(`  - delivered: ${delivery.delivered}`);
        console.log(`  - messageId: ${delivery.messageId || '(none)'}`);
      } catch (mailError) {
        // Email failed but executor token was updated successfully
        // This is not a critical error - the verification link is still valid
        console.warn('[Executor Controller] [Background] Resend email failed (non-critical)');
        console.warn(`  - executor_id: ${executor.executor_id}`);
        console.warn(`  - executor_email: ${executor.executor_email}`);
        console.warn(`  - message: ${mailError.message}`);
        console.warn(`  - code: ${mailError.code || '(none)'}`);
        console.warn(`  - fallback: verification URL is logged above and available via API response`);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Executor verification email will be sent shortly.',
      data: {
        executor_id: executor.executor_id,
        verification_email_sent: 'pending',
        verification_preview_url: process.env.NODE_ENV === 'development' ? fallbackVerificationUrl : undefined
      }
    });
  } catch (error) {
    console.error('Resend Executor Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend executor verification email'
    });
  }
}

async function verifyExecutorToken(req, res) {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).send('Verification token is required.');
    }

    const tokenHash = hashVerificationToken(token);
    const { rows } = await pool.query(
      `SELECT executor_id, executor_name, executor_email, verification_status
       FROM executors
       WHERE verification_token_hash = $1
         AND verification_token_expires_at IS NOT NULL
         AND verification_token_expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(400).send('Verification link is invalid or has expired.');
    }

    const executor = rows[0];

    return res.status(200).json({
      success: true,
      message: 'Verification token is valid',
      data: {
        executor_id: executor.executor_id,
        executor_name: executor.executor_name,
        executor_email: executor.executor_email,
        verification_status: executor.verification_status
      }
    });
  } catch (error) {
    console.error('Verify Executor Token Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify executor token'
    });
  }
}

async function grantAccess(req, res) {
  try {
    const userId = req.userId;
    const executorId = Number.parseInt(req.params.id, 10);

    console.log('[Executor Controller] grantAccess called');
    console.log(`  - userId: ${userId}`);
    console.log(`  - executorId: ${executorId}`);

    if (!Number.isInteger(executorId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid executor id is required'
      });
    }

    // Verify executor belongs to user and is verified
    const { rows: executorRows } = await pool.query(
      `SELECT
        executor_id,
        executor_name,
        executor_email,
        verification_status,
        access_granted
      FROM executors
      WHERE executor_id = $1 AND user_id = $2`,
      [executorId, userId]
    );

    if (executorRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Executor not found'
      });
    }

    const executor = executorRows[0];

    if (executor.verification_status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Executor must be verified before granting access'
      });
    }

    if (executor.access_granted) {
      return res.status(400).json({
        success: false,
        message: 'Access is already granted to this executor'
      });
    }

    // Grant access
    const { rows: updatedRows } = await pool.query(
      `UPDATE executors
       SET access_granted = true, updated_at = CURRENT_TIMESTAMP
       WHERE executor_id = $1
       RETURNING
         executor_id,
         executor_name,
         executor_email,
         executor_phone,
         relationship,
         verification_status,
         access_granted,
         created_at`,
      [executorId]
    );

    const updatedExecutor = updatedRows[0];
    console.log('[Executor Controller] Access granted successfully');
    console.log(`  - executor_id: ${updatedExecutor.executor_id}`);
    console.log(`  - access_granted: ${updatedExecutor.access_granted}`);

    return res.status(200).json({
      success: true,
      message: 'Access granted to executor',
      data: buildExecutorResponse(updatedExecutor)
    });
  } catch (error) {
    console.error('Grant Access Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to grant access to executor'
    });
  }
}

async function revokeAccess(req, res) {
  try {
    const userId = req.userId;
    const executorId = Number.parseInt(req.params.id, 10);

    console.log('[Executor Controller] revokeAccess called');
    console.log(`  - userId: ${userId}`);
    console.log(`  - executorId: ${executorId}`);

    if (!Number.isInteger(executorId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid executor id is required'
      });
    }

    // Verify executor belongs to user
    const { rows: executorRows } = await pool.query(
      `SELECT
        executor_id,
        executor_name,
        executor_email,
        verification_status,
        access_granted
      FROM executors
      WHERE executor_id = $1 AND user_id = $2`,
      [executorId, userId]
    );

    if (executorRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Executor not found'
      });
    }

    const executor = executorRows[0];

    if (!executor.access_granted) {
      return res.status(400).json({
        success: false,
        message: 'Access is not currently granted to this executor'
      });
    }

    // Revoke access
    const { rows: updatedRows } = await pool.query(
      `UPDATE executors
       SET access_granted = false, updated_at = CURRENT_TIMESTAMP
       WHERE executor_id = $1
       RETURNING
         executor_id,
         executor_name,
         executor_email,
         executor_phone,
         relationship,
         verification_status,
         access_granted,
         created_at`,
      [executorId]
    );

    const updatedExecutor = updatedRows[0];
    console.log('[Executor Controller] Access revoked successfully');
    console.log(`  - executor_id: ${updatedExecutor.executor_id}`);
    console.log(`  - access_granted: ${updatedExecutor.access_granted}`);

    return res.status(200).json({
      success: true,
      message: 'Access revoked from executor',
      data: buildExecutorResponse(updatedExecutor)
    });
  } catch (error) {
    console.error('Revoke Access Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke access from executor'
    });
  }
}

module.exports = {
  addExecutor,
  getExecutors,
  resendExecutorVerification,
  verifyExecutorToken,
  grantAccess,
  revokeAccess
};
