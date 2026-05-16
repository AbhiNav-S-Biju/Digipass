const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const pool = require('../../config/database');
const { 
  getUserWithAssets, 
  getExecutorsByUserId, 
  getEmergencyContactsByUserId 
} = require('../utils/willQueries');

/**
 * GET /api/will/download/:userId
 * Generates and downloads a Digital Will PDF for the specified user
 */
router.get('/download/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Fetch user data with assets
    const user = await getUserWithAssets(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch executors
    const executors = await getExecutorsByUserId(userId);

    // Fetch emergency contacts
    const emergencyContacts = await getEmergencyContactsByUserId(userId);

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
      assets: user.assets.map((asset, idx) => ({
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

    // Call Python script to generate PDF
    const pythonProcess = spawn('python', [path.join(__dirname, '../../generate-will.py')]);

    let pdfBuffer = Buffer.alloc(0);
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      pdfBuffer = Buffer.concat([pdfBuffer, data]);
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate PDF',
          error: errorOutput
        });
      }

      // Set response headers for file download
      const filename = `Digital_Will_${userId}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF to client
      res.send(pdfBuffer);
    });

    // Send data to Python script via stdin
    pythonProcess.stdin.write(JSON.stringify(pdfData));
    pythonProcess.stdin.end();

  } catch (error) {
    console.error('Error in willRoutes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/will/preview/:userId
 * Returns the will data without generating PDF (for preview/verification)
 */
router.get('/preview/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Fetch user data with assets
    const user = await getUserWithAssets(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch executors
    const executors = await getExecutorsByUserId(userId);

    // Fetch emergency contacts
    const emergencyContacts = await getEmergencyContactsByUserId(userId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          created_at: user.created_at
        },
        assets: user.assets,
        executors: executors,
        emergency_contacts: emergencyContacts
      }
    });

  } catch (error) {
    console.error('Error in willRoutes preview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
