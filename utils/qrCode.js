const QRCode = require('qrcode');

/**
 * Generate QR code for executor verification
 * @param {string} token - Verification token
 * @returns {Promise<string>} QR code as data URL (can be used in img src)
 */
async function generateExecutorVerificationQR(token) {
  try {
    const verificationUrl = getExecutorVerificationUrl(token);
    console.log('[QR Code] Generating QR code for verification URL:', verificationUrl);
    
    const qrCode = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300
    });
    
    console.log('[QR Code] QR code generated successfully');
    return qrCode;
  } catch (error) {
    console.error('[QR Code] Error generating QR code:', error);
    throw error;
  }
}

/**
 * Get the executor verification URL
 * @param {string} token - Verification token
 * @returns {string} Verification URL
 */
function getExecutorVerificationUrl(token) {
  // Use FRONTEND_URL for frontend file, fallback to APP_BASE_URL for local dev
  const frontendUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || 'http://localhost:3000';
  return `${frontendUrl}/executor-verify.html?token=${token}`;
}

module.exports = {
  generateExecutorVerificationQR,
  getExecutorVerificationUrl
};
