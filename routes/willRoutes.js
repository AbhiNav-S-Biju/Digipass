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
    const user = await getUserWithAssets(userId);
    if (!user) {
      console.log(`[PDF Download] User ${userId} not found`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch executors
    const executors = await getExecutorsByUserId(userId);
    console.log(`[PDF Download] Found ${executors.length} executors for user ${userId}`);

    // Fetch emergency contacts
    const emergencyContacts = await getEmergencyContactsByUserId(userId);
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

    // Call Python script to generate PDF
    const pythonProcess = spawn('python', [path.join(__dirname, '../generate-will.py')]);

    let pdfBuffer = Buffer.alloc(0);
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      pdfBuffer = Buffer.concat([pdfBuffer, data]);
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('[PDF Generation] Error:', errorOutput);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('[PDF Generation] Process exited with code:', code);
        console.error('[PDF Generation] Error output:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate PDF',
          error: errorOutput
        });
      }

      if (pdfBuffer.length === 0) {
        console.error('[PDF Generation] No PDF data received');
        return res.status(500).json({
          success: false,
          message: 'PDF generation produced no output'
        });
      }

      console.log(`[PDF Download] Successfully generated PDF (${pdfBuffer.length} bytes)`);

      // Set response headers for PDF download
      const dateStr = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Digital_Will_${userId}_${dateStr}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the PDF
      res.send(pdfBuffer);
    });

    // Send data to Python process via stdin
    pythonProcess.stdin.write(JSON.stringify(pdfData));
    pythonProcess.stdin.end();

  } catch (error) {
    console.error('[PDF Download] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process will download'
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
