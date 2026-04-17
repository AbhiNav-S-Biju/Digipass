// Comprehensive logging utility
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const formatLog = (level, category, message, data = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    data
  });
};

const getLogFile = (category) => {
  const date = new Date().toISOString().split('T')[0];
  return path.join(logDir, `${category}-${date}.log`);
};

const writeLog = (level, category, message, data) => {
  const logEntry = formatLog(level, category, message, data);
  const logFile = getLogFile(category);
  
  fs.appendFileSync(logFile, logEntry + '\n', 'utf8');
  
  // Also console log
  const prefix = `[${category}] [${level}]`;
  if (level === LOG_LEVELS.ERROR) {
    console.error(prefix, message, data);
  } else if (level === LOG_LEVELS.WARN) {
    console.warn(prefix, message, data);
  } else {
    console.log(prefix, message, data);
  }
};

// Executor action logging
const logExecutorAction = (actionType, executorId, details = {}) => {
  writeLog(LOG_LEVELS.INFO, 'EXECUTOR_ACTIONS', actionType, {
    executorId,
    ...details,
    userAgent: details.userAgent || 'N/A',
    ipAddress: details.ipAddress || 'N/A'
  });
};

// Authentication logging
const logAuthAction = (actionType, userId, details = {}) => {
  writeLog(LOG_LEVELS.INFO, 'AUTH_ACTIONS', actionType, {
    userId,
    ...details
  });
};

// API request logging
const logApiRequest = (method, path, statusCode, duration, details = {}) => {
  writeLog(LOG_LEVELS.INFO, 'API_REQUESTS', `${method} ${path}`, {
    statusCode,
    durationMs: duration,
    ...details
  });
};

// Error logging
const logError = (category, message, error, context = {}) => {
  writeLog(LOG_LEVELS.ERROR, category, message, {
    errorMessage: error?.message,
    errorStack: error?.stack,
    ...context
  });
};

module.exports = {
  LOG_LEVELS,
  logExecutorAction,
  logAuthAction,
  logApiRequest,
  logError,
  writeLog
};
