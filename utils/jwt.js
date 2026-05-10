const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log('[JWT] JWT_SECRET initialized:', {
  is_env_set: !!process.env.JWT_SECRET,
  secret_length: JWT_SECRET.length,
  secret_preview: JWT_SECRET.substring(0, 15) + '***'
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const generateExecutorToken = (executor) => {
  const token = jwt.sign(
    {
      type: 'executor',
      executorId: executor.executor_id,
      userId: executor.user_id,
      email: executor.executor_email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log('[JWT] Generated executor token:', {
    has_token: !!token,
    token_length: token?.length,
    token_preview: token?.substring(0, 20),
    executorId: executor.executor_id,
    userId: executor.user_id
  });
  
  return token;
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error('[JWT] Token verification failed:', {
      error: err.message,
      name: err.name,
      secret_length: JWT_SECRET.length,
      token_prefix: token.substring(0, 20)
    });
    return null;
  }
};

module.exports = { generateToken, generateExecutorToken, verifyToken };
