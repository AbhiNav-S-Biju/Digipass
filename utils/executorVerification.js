const crypto = require('crypto');

const TOKEN_TTL_HOURS = 24;

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashVerificationToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getVerificationExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_TTL_HOURS);
  return expiresAt;
}

module.exports = {
  TOKEN_TTL_HOURS,
  generateVerificationToken,
  hashVerificationToken,
  getVerificationExpiryDate
};
