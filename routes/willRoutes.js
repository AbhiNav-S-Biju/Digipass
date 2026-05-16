const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const { generateWill, downloadWill, updateWillContent, getWillContent, executorDownloadWill } = require('../controllers/willController');
const { authenticateToken: authMiddleware } = require('../middleware/auth');
const { authenticateExecutor } = require('../middleware/executorAuth');
const pool = require('../db');
const { 
  getUserWithAssets, 
  getExecutorsByUserId, 
  getEmergencyContactsByUserId 
} = require('../utils/willQueries');

// Executor endpoint (must be before authMiddleware)
router.get('/executor/download-will', authenticateExecutor, executorDownloadWill);

/**
 * GET /api/executor/will/download/:userId
 * New PDF generation endpoint for executors
 * Protected by executor authentication
 */
router.get('/executor/will/download/:userId', authenticateExecutor, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const ownerUserId = req.ownerUserId; // From executor auth middleware

    console.log(`[PDF Download] User ID from params: ${userId}, Owner User ID from auth: ${ownerUserId}`);
    
    // Security check: executor can only download will for their assigned owner
    if (userId !== ownerUserId) {
      console.log(`[PDF Download] Executor ${req.executorId} trying to access unauthorized user ${userId}`);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this will'
      });
    }
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Fetch user data with assets
    let user;
    try {
      user = await getUserWithAssets(userId);
    } catch (dbError) {
      console.error(`[PDF Download] Database error fetching user ${userId}:`, dbError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user data',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    if (!user) {
      console.log(`[PDF Download] User ${userId} not found`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch executors
    let executors;
    try {
      executors = await getExecutorsByUserId(userId);
    } catch (dbError) {
      console.error(`[PDF Download] Database error fetching executors:`, dbError.message);
      executors = []; // Fallback to empty array
    }
    console.log(`[PDF Download] Found ${executors.length} executors for user ${userId}`);

    // Fetch emergency contacts
    let emergencyContacts;
    try {
      emergencyContacts = await getEmergencyContactsByUserId(userId);
    } catch (dbError) {
      console.error(`[PDF Download] Database error fetching emergency contacts:`, dbError.message);
      emergencyContacts = []; // Fallback to empty array
    }
    console.log(`[PDF Download] Found ${emergencyContacts.length} emergency contacts`);

    // Prepare data for PDF generation
    const pdfData = {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at ? user.created_at.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      },
      assets: user.assets.map((asset) => ({
        name: asset.name || 'Unnamed Asset',
        category: asset.category || 'digital',
        description: asset.description || '',
        preferred_action: asset.preferred_action || 'manage',
        final_message: asset.final_message || '',
        created_at: asset.created_at ? asset.created_at.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      })),
      executors: executors.map(executor => ({
        name: executor.full_name,
        email: executor.email,
        relationship: executor.relationship || '',
        status: executor.verification_status || 'Pending',
        access_granted: executor.access_granted || false,
        created_at: executor.created_at ? executor.created_at.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      })),
      emergency_contacts: emergencyContacts.map(contact => ({
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone_number
      }))
    };

    console.log(`[PDF Download] Spawning Python process for PDF generation`);
    console.log(`[PDF Download] Script path: ${path.join(__dirname, '../generate-will.py')}`);

    // Call Python script to generate PDF
    // Try different ways to invoke Python for maximum compatibility
    let pythonProcess;
    let pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    console.log(`[PDF Download] Using python command: ${pythonCmd}`);
    
    const scriptPath = path.join(__dirname, '../generate-will.py');
    pythonProcess = spawn(pythonCmd, [scriptPath]);

    let pdfBuffer = Buffer.alloc(0);
    let errorOutput = '';
    let isResponseSent = false;

    // Handle spawn errors
    pythonProcess.on('error', (err) => {
      console.error('[PDF Generation] Spawn error:', err);
      if (!isResponseSent) {
        isResponseSent = true;
        return res.status(500).json({
          success: false,
          message: 'Failed to spawn PDF generator process',
          error: err.message
        });
      }
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`[PDF Generation] Received ${data.length} bytes of data`);
      pdfBuffer = Buffer.concat([pdfBuffer, data]);
    });

    pythonProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      console.error('[PDF Generation] stderr:', errorMsg);
      errorOutput += errorMsg;
    });

    pythonProcess.on('close', (code) => {
      if (isResponseSent) {
        return; // Response already sent
      }

      console.log(`[PDF Generation] Process closed with code: ${code}, buffer size: ${pdfBuffer.length}`);

      if (code !== 0) {
        console.error('[PDF Generation] Process exited with code:', code);
        console.error('[PDF Generation] Full error output:', errorOutput);
        isResponseSent = true;
        return res.status(500).json({
          success: false,
          message: 'PDF generation failed',
          error: errorOutput || `Process exited with code ${code}`
        });
      }

      if (pdfBuffer.length === 0) {
        console.error('[PDF Generation] No PDF data received');
        isResponseSent = true;
        return res.status(500).json({
          success: false,
          message: 'PDF generation produced no output',
          error: errorOutput
        });
      }

      console.log(`[PDF Download] Successfully generated PDF (${pdfBuffer.length} bytes)`);

      // Set response headers for PDF download
      const dateStr = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Digital_Will_${userId}_${dateStr}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      isResponseSent = true;
      // Send the PDF
      res.send(pdfBuffer);
    });

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!isResponseSent) {
        isResponseSent = true;
        console.error('[PDF Generation] Timeout: Process took too long');
        pythonProcess.kill();
        res.status(500).json({
          success: false,
          message: 'PDF generation timed out'
        });
      }
    }, 30000); // 30 second timeout

    pythonProcess.on('close', () => {
      clearTimeout(timeout);
    });

    // Send data to Python process via stdin
    try {
      const jsonData = JSON.stringify(pdfData);
      console.log(`[PDF Download] Sending ${jsonData.length} bytes of JSON data to Python`);
      pythonProcess.stdin.write(jsonData);
      pythonProcess.stdin.end();
    } catch (err) {
      console.error('[PDF Generation] Error writing to stdin:', err);
      if (!isResponseSent) {
        isResponseSent = true;
        res.status(500).json({
          success: false,
          message: 'Failed to send data to PDF generator'
        });
      }
    }

  } catch (error) {
    console.error('[PDF Download] Unexpected error:', error);
    console.error('[PDF Download] Error stack:', error.stack);
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json({
      success: false,
      message: 'Failed to process will download',
      error: isDev ? error.message : undefined,
      details: isDev ? error.toString() : undefined
    });
  }
});

router.use(authMiddleware);

router.get('/generate-will', generateWill);
router.get('/download-will/:willId', downloadWill);
router.get('/will-content', getWillContent);
router.post('/will-content', updateWillContent);

/**
 * Check if a digital will exists for the user
 * GET /api/will (called from frontend as '/will')
 */
router.get('/will', async (req, res) => {
  try {
    const userId = req.userId;
    
    const { rows } = await pool.query(
      `SELECT will_id, created_at FROM digital_will
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
        created_at: rows[0].created_at
      },
      message: 'Will exists'
    });
  } catch (err) {
    console.error('Error checking will existence:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to check will status'
    });
  }
});

module.exports = router;
