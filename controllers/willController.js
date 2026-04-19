const fs = require('fs');
const path = require('path');
const pool = require('../db');
const { generateWillPdf } = require('../utils/willPdf');
const { logActivity } = require('../utils/activityLogger');

function buildActions(user, assets, executors) {
  const actions = [];

  actions.push(`Review and manage ${assets.length} digital asset(s) listed in this will.`);

  if (executors.length === 0) {
    actions.push('No executor has been assigned yet. Add an executor to enable estate handoff planning.');
  } else {
    executors.forEach((executor) => {
      actions.push(
        `Executor ${executor.executor_name} is currently ${executor.verification_status} and access is ${executor.access_granted ? 'granted' : 'not granted'}.`
      );
    });
  }

  if (assets.length === 0) {
    actions.push('No digital assets are currently recorded. Add assets so they can be referenced in future will exports.');
  } else {
    const assetTypes = [...new Set(assets.map((asset) => asset.category))];
    actions.push(`Asset categories covered: ${assetTypes.join(', ')}.`);
  }

  actions.push(`This digital will was generated for ${user.full_name} (${user.email}).`);

  return actions;
}

async function ensureDigitalWillTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS digital_will (
      will_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_digital_will_user_id
    ON digital_will(user_id)
  `);
}

async function generateWill(req, res, next) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [userResult, assetsResult, executorsResult] = await Promise.all([
      pool.query(
        `SELECT user_id, full_name, email
         FROM users
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT asset_id, platform_name, category, account_identifier, 
                account_password, action_type, last_message, created_at
         FROM digital_assets
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT executor_id, executor_name, executor_email, executor_phone, 
                relationship, verification_status, access_granted, created_at
         FROM executors
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      )
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const assets = assetsResult.rows;
    const executors = executorsResult.rows;
    const actions = buildActions(user, assets, executors);

    const willDirectory = path.join(process.cwd(), 'generated-wills');
    if (!fs.existsSync(willDirectory)) {
      fs.mkdirSync(willDirectory, { recursive: true });
    }

    const fileName = `digital-will-user-${userId}-${Date.now()}.pdf`;
    const absoluteFilePath = path.join(willDirectory, fileName);
    const storedFilePath = path.join('generated-wills', fileName).replace(/\\/g, '/');

    await generateWillPdf({
      outputPath: absoluteFilePath,
      user,
      assets,
      executors,
      actions
    });

    await ensureDigitalWillTable();

    const { rows } = await pool.query(
      `INSERT INTO digital_will (user_id, file_path, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING will_id, file_path, created_at`,
      [userId, storedFilePath]
    );

    const will = rows[0];
    
    // Log activity
    await logActivity(
      userId,
      'will_created',
      'Digital will created/updated',
      'will',
      will.will_id
    );

    // Return download URL instead of file path
    const downloadUrl = `${process.env.BACKEND_URL}/api/download-will/${will.will_id}`;

    return res.status(200).json({
      success: true,
      message: 'Digital will generated successfully',
      data: {
        will_id: will.will_id,
        download_url: downloadUrl,
        file_path: will.file_path,
        created_at: will.created_at,
        summary: {
          user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email
          },
          asset_count: assets.length,
          executor_count: executors.length,
          actions
        }
      }
    });
  } catch (error) {
    console.error('Generate Will Error:', error);
    next(error);
  }
}

async function downloadWill(req, res, next) {
  try {
    const userId = req.userId;
    const willId = req.params.willId;

    if (!userId || !willId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Verify will exists and belongs to user
    const { rows } = await pool.query(
      `SELECT will_id, user_id, file_path
       FROM digital_will
       WHERE will_id = $1 AND user_id = $2`,
      [willId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Will not found or access denied'
      });
    }

    const filePath = path.join(process.cwd(), rows[0].file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }

    // Send file as attachment with proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="digital-will.pdf"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file'
        });
      } else {
        res.end();
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('Download Will Error:', error);
    next(error);
  }
}

module.exports = {
  generateWill,
  downloadWill
};
