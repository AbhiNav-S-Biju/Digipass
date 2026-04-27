const { verifyToken } = require('../utils/jwt');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer token'

  if (!token) {
    console.error('[AUTH] No token provided in Authorization header');
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided. Please login.' 
    });
  }

  console.log('[AUTH] Token found, verifying...');
  const decoded = verifyToken(token);
  
  if (!decoded) {
    console.error('[AUTH] Token verification failed');
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }

  console.log('[AUTH] Token verified for userId:', decoded.userId);
  req.userId = decoded.userId;
  next();
};

module.exports = { authenticateToken };
