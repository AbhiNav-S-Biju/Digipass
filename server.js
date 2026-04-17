const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startDeadMansSwitchScheduler } = require('./utils/deadMansSwitchScheduler');
const { initResend } = require('./utils/mailer');
const { errorHandler } = require('./utils/errorHandler');
const { logApiRequest } = require('./utils/logger');
const { createApiRateLimiter, createAuthRateLimiter } = require('./utils/rateLimiter');
const {
  initializeUsersTable,
  initializeUserActivityColumns,
  initializeDigitalAssetsTable,
  initializeExecutorsTable,
  initializeDeadMansSwitchTable,
  initializeDigitalWillTable
} = require('./utils/dbInit');

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logApiRequest(req.method, req.path, res.statusCode, duration, {
      userId: req.user?.id
    });
  });
  next();
});

// Rate limiting
app.use('/api/auth/login', createAuthRateLimiter());
app.use('/api/auth/register', createAuthRateLimiter());
app.use('/api', createApiRateLimiter());

// Database initialization middleware (runs once on first request)
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      console.log('[DB] Initializing database tables...');
      await initializeUsersTable();
      await initializeUserActivityColumns();
      await initializeDigitalAssetsTable();
      await initializeExecutorsTable();
      await initializeDeadMansSwitchTable();
      await initializeDigitalWillTable();
      console.log('[DB] ✓ Database initialization complete');
      dbInitialized = true;
    } catch (err) {
      console.error('[DB] Initialization failed:', err.message);
      dbInitialized = true; // Mark as attempted to prevent retry loop
    }
  }
  next();
});

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
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ DIGIPASS API running on port ${PORT}`);
  
  // Initialize Resend for email
  initResend();
  
  console.log('[Email Debug] Environment loaded:');
  console.log(`  - APP_BASE_URL: ${process.env.APP_BASE_URL || '(missing)'}`);
  console.log(`  - RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'loaded' : '(missing)'}`);
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
