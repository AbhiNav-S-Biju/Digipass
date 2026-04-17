// Standardized error responses
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }
}

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, {
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    details: err.details
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { details: err.details, stack: err.stack }),
    timestamp: new Date()
  });
};

// Common error responses
const errors = {
  validationError: (message, details) => 
    new ApiError(400, message || 'Validation error', details),
  
  unauthorized: (message = 'Unauthorized') => 
    new ApiError(401, message),
  
  forbidden: (message = 'Forbidden') => 
    new ApiError(403, message),
  
  notFound: (message = 'Resource not found') => 
    new ApiError(404, message),
  
  conflict: (message = 'Resource already exists') => 
    new ApiError(409, message),
  
  serverError: (message = 'Internal Server Error', details) => 
    new ApiError(500, message, details),
  
  rateLimited: () => 
    new ApiError(429, 'Too many requests. Please try again later.'),
  
  badRequest: (message, details) =>
    new ApiError(400, message || 'Bad request', details)
};

module.exports = {
  ApiError,
  errorHandler,
  errors
};
