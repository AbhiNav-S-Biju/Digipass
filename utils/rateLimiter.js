// Rate limiting middleware
const rateLimit = {};

const getRateLimitKey = (req) => {
  // Use IP address as key
  return req.ip || req.connection.remoteAddress || 'unknown';
};

const resetRateLimit = (key, windowMs) => {
  setTimeout(() => {
    delete rateLimit[key];
  }, windowMs);
};

const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxRequests = options.maxRequests || 100;
  const message = options.message || 'Too many requests. Please try again later.';
  const skipSuccessfulRequests = options.skipSuccessfulRequests !== false;

  return (req, res, next) => {
    const key = getRateLimitKey(req);
    const now = Date.now();

    if (!rateLimit[key]) {
      rateLimit[key] = {
        count: 0,
        resetTime: now + windowMs,
        requests: []
      };
    }

    const record = rateLimit[key];

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.requests = [];
      record.resetTime = now + windowMs;
    }

    // Log request
    record.requests.push({
      timestamp: now,
      path: req.path,
      method: req.method
    });

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    // Increment counter
    record.count++;

    // Add reset headers
    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', record.resetTime);
    res.setHeader('Retry-After', retryAfter);

    // Hook into response to skip count on success if configured
    if (skipSuccessfulRequests) {
      const originalJson = res.json;
      res.json = function(data) {
        if (data?.success === false || res.statusCode >= 400) {
          // Keep the count for errors
        }
        return originalJson.call(this, data);
      };
    }

    next();
  };
};

// Specific rate limiters
const createAuthRateLimiter = () => createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts
  message: 'Too many login attempts. Please try again in 15 minutes.'
});

const createApiRateLimiter = () => createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  message: 'Too many API requests. Please slow down.'
});

const createRegistrationRateLimiter = () => createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour
  message: 'Too many registration attempts. Please try again in 1 hour.'
});

module.exports = {
  createRateLimiter,
  createAuthRateLimiter,
  createApiRateLimiter,
  createRegistrationRateLimiter
};
