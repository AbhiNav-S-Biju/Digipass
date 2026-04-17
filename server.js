const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startDeadMansSwitchScheduler } = require('./utils/deadMansSwitchScheduler');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Allow browser requests from configured frontends and tools like curl/Postman with no Origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static('frontend'));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/index.html');
});

// Routes
const authRoutes = require('./routes/authRoutes');
const assetsRoutes = require('./routes/assetsRoutes');
const executorsRoutes = require('./routes/executorsRoutes');
const executorPortalRoutes = require('./routes/executorPortalRoutes');
const willRoutes = require('./routes/willRoutes');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DIGIPASS API Running',
    timestamp: new Date()
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Assets routes
app.use('/api/assets', assetsRoutes);

// Executors routes
app.use('/api/executors', executorsRoutes);

// Executor portal routes
app.use('/api', executorPortalRoutes);

// Digital will routes
app.use('/api', willRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ DIGIPASS API running on port ${PORT}`);
  console.log('[SMTP Debug] Environment loaded:');
  console.log(`  - APP_BASE_URL: ${process.env.APP_BASE_URL || '(missing)'}`);
  console.log(`  - SMTP_HOST: ${process.env.SMTP_HOST || '(missing)'}`);
  console.log(`  - SMTP_PORT: ${process.env.SMTP_PORT || '(missing)'}`);
  console.log(`  - SMTP_SECURE: ${process.env.SMTP_SECURE || '(missing)'}`);
  console.log(`  - SMTP_USER: ${process.env.SMTP_USER ? 'loaded' : '(missing)'}`);
  console.log(`  - SMTP_PASS: ${process.env.SMTP_PASS ? 'loaded' : '(missing)'}`);
  console.log(`  - EMAIL_FROM: ${process.env.EMAIL_FROM || '(missing)'}`);
  console.log(`Available endpoints:`);
  console.log(`  - POST   /api/auth/register (public)`);
  console.log(`  - POST   /api/auth/login (public)`);
  console.log(`  - GET    /api/auth/me (protected)`);
  console.log(`  - GET    /api/health (public)`);
  console.log(`  - POST   /api/assets (protected)`);
  console.log(`  - GET    /api/assets (protected)`);
  console.log(`  - DELETE /api/assets/:id (protected)`);
  console.log(`  - POST   /api/executors (protected)`);
  console.log(`  - GET    /api/executors (protected)`);
  console.log(`  - GET    /api/executors/verify?token=... (public)`);
  console.log(`  - POST   /api/executors/:id/resend-verification (protected)`);
  console.log(`  - POST   /api/executor/login (public with strict executor checks)`);
  console.log(`  - POST   /api/executor/register (public token-based registration)`);
  console.log(`  - GET    /api/executor/assets (executor protected)`);
  console.log(`  - GET    /api/generate-will (protected)`);
  
  // Start dead man's switch scheduler asynchronously (non-blocking)
  setImmediate(() => {
    try {
      startDeadMansSwitchScheduler();
    } catch (err) {
      console.error('[DeadMansSwitch] Failed to start scheduler:', err.message);
    }
  });
});
