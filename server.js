const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { startDeadMansSwitchScheduler } = require('./utils/deadMansSwitchScheduler');
const { initSendGrid } = require('./utils/mailer');
const { errorHandler } = require('./utils/errorHandler');
const { logApiRequest } = require('./utils/logger');
const { createApiRateLimiter, createAuthRateLimiter } = require('./utils/rateLimiter');
const {
  initializeUsersTable,
  initializeUserActivityColumns,
  initializeDigitalAssetsTable,
  initializeExecutorsTable,
  initializeDeadMansSwitchTable,
  initializeDigitalWillTable,
  initializeActivityTable
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
    // Get userId from multiple auth sources: JWT middleware (req.userId), user object, executor auth, or owner
    const userId = req.userId || req.user?.id || req.executor?.user_id || req.ownerUserId;
    logApiRequest(req.method, req.path, res.statusCode, duration, {
      userId: userId
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
      await initializeActivityTable();
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

// Disable caching for HTML files to prevent stale versions
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path.endsWith('.html/')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

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
const deadMansSwitchRoutes = require('./routes/deadMansSwitchRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Disable ETags for API routes (prevents 304 responses)
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

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

// Dead man's switch routes
app.use('/api/dead-mans-switch', deadMansSwitchRoutes);

// Activity routes
app.use('/api/activity', activityRoutes);
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
  console.log(`📋 PDF Generation Engine: Enhanced Layout v1.1`);
  
  // Initialize SendGrid for email
  initSendGrid();
  
  console.log(`[Email] ${process.env.SENDGRID_API_KEY ? 'SendGrid key loaded' : 'SENDGRID_API_KEY missing'}; from ${process.env.EMAIL_FROM || '(missing)'}`);
  
  // Start dead man's switch scheduler asynchronously (non-blocking)
  setImmediate(() => {
    try {
      startDeadMansSwitchScheduler();
    } catch (err) {
      console.error('[DeadMansSwitch] Failed to start scheduler:', err.message);
    }
  });
});
