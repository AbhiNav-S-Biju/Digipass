const { verifyToken } = require('../utils/jwt');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from 'Bearer token'

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided. Please login.' 
    });
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }

  req.userId = decoded.userId;
  next();
};

module.exports = { authenticateToken };
