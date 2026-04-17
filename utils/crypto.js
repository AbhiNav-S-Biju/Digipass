const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'your-secret-key-change-in-production', 'salt', 32);

/**
 * Encrypt data using AES-256-GCM
 * Returns: { encrypted: Buffer, iv: Buffer, authTag: Buffer }
 */
const encryptData = (plaintext) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(JSON.stringify(plaintext), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (err) {
    throw new Error('Encryption failed: ' + err.message);
  }
};

/**
 * Decrypt data using AES-256-GCM
 * Input: { encrypted: string, iv: string, authTag: string }
 * Returns: decrypted object
 */
const decryptData = (encryptedObj) => {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      Buffer.from(encryptedObj.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedObj.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedObj.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (err) {
    throw new Error('Decryption failed: ' + err.message);
  }
};

module.exports = {
  encryptData,
  decryptData
};
