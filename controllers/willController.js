const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const pool = require('../db');
const { logActivity } = require('../utils/activityLogger');

async function ensureDigitalWillTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS digital_will (
      will_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      custom_content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_digital_will_user_id
    ON digital_will(user_id)
  `);

  // Add custom_content column if it doesn't exist
  await pool.query(`
    ALTER TABLE digital_will
    ADD COLUMN IF NOT EXISTS custom_content TEXT
  `).catch(() => {
    // Column already exists, ignore error
  });
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

    const [userResult, assetsResult, executorsResult, customContentResult] = await Promise.all([
      pool.query(
        `SELECT user_id, full_name, email, created_at
         FROM users
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT asset_id, platform_name as name, category, account_identifier,
                action_type as preferred_action, last_message as final_message, created_at
         FROM digital_assets
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT executor_id, executor_name as name, executor_email as email, executor_phone,
                relationship, verification_status as status, access_granted, created_at
         FROM executors
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT custom_content, created_at FROM digital_will
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
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
    const customContent = customContentResult.rows.length > 0 ? customContentResult.rows[0].custom_content : null;

    // Prepare data for Python PDF generator (matching generate-will.py format)
    const pdfData = {
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString()
      },
      assets: assets.map(asset => ({
        name: asset.name || 'Unnamed Asset',
        category: asset.category || 'digital',
        platform: asset.platform_name || '',
        account_username: asset.account_identifier || '',
        preferred_action: asset.preferred_action || 'no_action',
        final_message: asset.final_message || '',
        created_at: asset.created_at ? asset.created_at.toISOString() : new Date().toISOString()
      })),
      executors: executors.map(executor => ({
        name: executor.name || 'Unnamed Executor',
        email: executor.email || '',
        phone: executor.executor_phone || '',
        relationship: executor.relationship || 'Other',
        role: executor.role || 'PRIMARY',
        status: executor.status || 'pending',
        access_granted: executor.access_granted || false,
        created_at: executor.created_at ? executor.created_at.toISOString() : new Date().toISOString()
      })),
      custom_content: customContent || null,
      will: {
        custom_content: customContent || '',
        created_at: customContentResult.rows[0]?.created_at
          ? customContentResult.rows[0].created_at.toISOString()
          : new Date().toISOString()
      }
    };

    // Ensure generated-wills directory exists
    const willDirectory = path.join(process.cwd(), 'generated-wills');
    if (!fs.existsSync(willDirectory)) {
      fs.mkdirSync(willDirectory, { recursive: true });
    }

    const fileName = `digital-will-user-${userId}-${Date.now()}.pdf`;
    const absoluteFilePath = path.join(willDirectory, fileName);
    const storedFilePath = path.join('generated-wills', fileName).replace(/\\/g, '/');

    // Call Python generate-will.py via subprocess
    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [path.join(process.cwd(), 'generate-will.py')], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let pdfBuffer = Buffer.alloc(0);
      let errorOutput = '';

      // Capture PDF from stdout
      pythonProcess.stdout.on('data', (chunk) => {
        pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
      });

      // Capture errors from stderr
      pythonProcess.stderr.on('data', (chunk) => {
        errorOutput += chunk.toString();
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          console.error('Python process error:', errorOutput);
          return res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
            error: errorOutput
          });
        }

        try {
          // Write PDF to disk
          fs.writeFileSync(absoluteFilePath, pdfBuffer);

          // Record in database
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

          const downloadUrl = `${process.env.BACKEND_URL}/api/download-will/${will.will_id}`;

          resolve(res.status(200).json({
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
                executor_count: executors.length
              }
            }
          }));
        } catch (error) {
          console.error('Database/file error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to save will',
            error: error.message
          });
        }
      });

      // Send JSON data to Python process stdin
      pythonProcess.stdin.write(JSON.stringify(pdfData));
      pythonProcess.stdin.end();
    });
  } catch (error) {
    console.error('Generate Will Error:', error);
    next(error);
  }
}

async function updateWillContent(req, res, next) {
  try {
    const userId = req.userId;
    const { custom_content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!custom_content || custom_content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Will content cannot be empty'
      });
    }

    await ensureDigitalWillTable();

    // Get the latest will or create a placeholder
    const { rows: existingRows } = await pool.query(
      `SELECT will_id FROM digital_will
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    let willId;
    
    if (existingRows.length > 0) {
      willId = existingRows[0].will_id;
      // Update existing will
      await pool.query(
        `UPDATE digital_will
         SET custom_content = $1, updated_at = NOW()
         WHERE will_id = $2 AND user_id = $3`,
        [custom_content.trim(), willId, userId]
      );
    } else {
      // Create a new will entry with custom content
      const { rows: newRows } = await pool.query(
        `INSERT INTO digital_will (user_id, custom_content, file_path, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING will_id`,
        [userId, custom_content.trim(), 'custom-will']
      );
      willId = newRows[0].will_id;
    }

    // Log activity
    await logActivity(
      userId,
      'will_updated',
      'Digital will content updated',
      'will',
      willId
    );

    return res.status(200).json({
      success: true,
      message: 'Will content updated successfully',
      data: {
        will_id: willId,
        custom_content: custom_content.trim()
      }
    });
  } catch (error) {
    console.error('Update Will Content Error:', error);
    next(error);
  }
}

async function getWillContent(req, res, next) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    await ensureDigitalWillTable();

    const { rows } = await pool.query(
      `SELECT will_id, custom_content, created_at, updated_at
       FROM digital_will
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No will exists'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        will_id: rows[0].will_id,
        custom_content: rows[0].custom_content,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Get Will Content Error:', error);
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
      `SELECT will_id, user_id, file_path, custom_content
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

async function executorDownloadWill(req, res, next) {
  try {
    const executorId = req.executorId;
    const executorEmail = req.executorEmail;

    if (!executorId || !executorEmail) {
      return res.status(401).json({
        success: false,
        message: 'Executor authentication required'
      });
    }

    // Get executor info and verify access is granted
    const { rows: executorRows } = await pool.query(
      `SELECT executor_id, user_id, access_granted, verification_status
       FROM executors
       WHERE executor_id = $1 AND executor_email = $2`,
      [executorId, executorEmail]
    );

    if (executorRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Executor not found'
      });
    }

    const executor = executorRows[0];

    // Check if executor has access
    if (!executor.access_granted) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this will'
      });
    }

    const userId = executor.user_id;

    // Get user, assets, executors, and custom content
    const [userResult, assetsResult, executorsResult, customContentResult] = await Promise.all([
      pool.query(
        `SELECT user_id, full_name, email, created_at
         FROM users
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT asset_id, platform_name as name, category, account_identifier,
                action_type as preferred_action, last_message as final_message, created_at
         FROM digital_assets
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT executor_id, executor_name as name, executor_email as email, executor_phone,
                relationship, verification_status as status, access_granted, created_at
         FROM executors
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT custom_content, created_at FROM digital_will
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
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
    const customContent = customContentResult.rows.length > 0 ? customContentResult.rows[0].custom_content : null;

    // Prepare data for Python PDF generator (matching generate-will.py format)
    const pdfData = {
      user: {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString()
      },
      assets: assets.map(asset => ({
        name: asset.name || 'Unnamed Asset',
        category: asset.category || 'digital',
        platform: asset.platform_name || '',
        account_username: asset.account_identifier || '',
        preferred_action: asset.preferred_action || 'no_action',
        final_message: asset.final_message || '',
        created_at: asset.created_at ? asset.created_at.toISOString() : new Date().toISOString()
      })),
      executors: executors.map(executor => ({
        name: executor.name || 'Unnamed Executor',
        email: executor.email || '',
        phone: executor.executor_phone || '',
        relationship: executor.relationship || 'Other',
        role: executor.role || 'PRIMARY',
        status: executor.status || 'pending',
        access_granted: executor.access_granted || false,
        created_at: executor.created_at ? executor.created_at.toISOString() : new Date().toISOString()
      })),
      custom_content: customContent || null,
      will: {
        custom_content: customContent || '',
        created_at: customContentResult.rows[0]?.created_at
          ? customContentResult.rows[0].created_at.toISOString()
          : new Date().toISOString()
      }
    };

    const willDirectory = path.join(process.cwd(), 'generated-wills');
    if (!fs.existsSync(willDirectory)) {
      fs.mkdirSync(willDirectory, { recursive: true });
    }

    const fileName = `digital-will-user-${userId}-executor-${executorId}-${Date.now()}.pdf`;
    const absoluteFilePath = path.join(willDirectory, fileName);

    // Call Python generate-will.py via subprocess
    const pythonProcess = spawn('python', [path.join(process.cwd(), 'generate-will.py')], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let pdfBuffer = Buffer.alloc(0);
    let errorOutput = '';

    // Capture PDF from stdout
    pythonProcess.stdout.on('data', (chunk) => {
      pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
    });

    // Capture errors from stderr
    pythonProcess.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate PDF',
          error: errorOutput
        });
      }

      try {
        // Write PDF to disk
        fs.writeFileSync(absoluteFilePath, pdfBuffer);

        // Send file as attachment
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="digital-will.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.end(pdfBuffer);

        // Log activity
        logActivity(
          userId,
          'will_downloaded',
          `Executor ${executorEmail} downloaded will`,
          'will',
          executorId
        ).catch(err => console.error('Activity log error:', err));
      } catch (error) {
        console.error('File write error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Failed to generate PDF'
          });
        } else {
          res.end();
        }
      }
    });

    // Send JSON data to Python process stdin
    pythonProcess.stdin.write(JSON.stringify(pdfData));
    pythonProcess.stdin.end();
  } catch (error) {
    console.error('Executor Download Will Error:', error);
    next(error);
  }
}

module.exports = {
  generateWill,
  downloadWill,
  updateWillContent,
  getWillContent,
  executorDownloadWill
};
