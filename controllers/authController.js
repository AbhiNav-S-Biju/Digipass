const pool = require('../db');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { errors } = require('../utils/errorHandler');
const { validateEmail, validatePassword, validateString } = require('../utils/validation');
const { logAuthAction, logError } = require('../utils/logger');

// Register user
const register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;

    // Validation
    if (!validateString(full_name, 2, 100)) {
      throw errors.validationError('Full name must be between 2 and 100 characters');
    }

    if (!validateEmail(email)) {
      throw errors.validationError('Invalid email format');
    }

    if (!validatePassword(password)) {
      throw errors.validationError(
        'Password must be at least 8 characters with uppercase, lowercase, number, and symbol'
      );
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userExists.rows.length > 0) {
      logAuthAction('REGISTRATION_FAILED', null, {
        reason: 'Email already exists',
        email: email.toLowerCase()
      });
      throw errors.conflict('Email already registered');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, full_name, email',
      [full_name.trim(), email.toLowerCase().trim(), password_hash]
    );

    const user = result.rows[0];
    const token = generateToken(user.user_id);

    logAuthAction('REGISTRATION_SUCCESS', user.user_id, {
      email: user.email,
      name: user.full_name
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        token
      }
    });
  } catch (err) {
    logError('REGISTRATION', 'Registration failed', err, { email: req.body.email });
    next(err);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!validateEmail(email)) {
      throw errors.validationError('Invalid email format');
    }

    if (!validateString(password, 1)) {
      throw errors.validationError('Password is required');
    }

    // Find user
    const result = await pool.query(
      'SELECT user_id, full_name, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      logAuthAction('LOGIN_FAILED', null, {
        reason: 'User not found',
        email: email.toLowerCase()
      });
      throw errors.unauthorized('Invalid email or password');
    }

    const user = result.rows[0];

    // Compare passwords
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      logAuthAction('LOGIN_FAILED', user.user_id, {
        reason: 'Invalid password',
        email: user.email
      });
      throw errors.unauthorized('Invalid email or password');
    }

    // Update last active and dead man's switch
    try {
      await pool.query(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE user_id = $1',
        [user.user_id]
      );

      // Ensure dead_mans_switch record exists
      await pool.query(
        `INSERT INTO dead_mans_switch (user_id, check_interval_days, last_checkin, status, created_at, updated_at)
         VALUES ($1, 30, CURRENT_TIMESTAMP, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET
         last_checkin = CURRENT_TIMESTAMP, status = 'active', updated_at = CURRENT_TIMESTAMP`,
        [user.user_id]
      );
    } catch (err) {
      logError('LOGIN', 'Failed to update user activity', err, { userId: user.user_id });
      // Don't fail login, just log it
    }

    // Generate token
    const token = generateToken(user.user_id);

    logAuthAction('LOGIN_SUCCESS', user.user_id, {
      email: user.email
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        token
      }
    });
  } catch (err) {
    logError('LOGIN', 'Login failed', err, { email: req.body.email });
    next(err);
  }
};

// Get current user (authenticated)
const getCurrentUser = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT user_id, full_name, email FROM users WHERE user_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      throw errors.notFound('User not found');
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email
      }
    });
  } catch (err) {
    logError('GET_USER', 'Failed to get user', err, { userId: req.userId });
    next(err);
  }
};

module.exports = { register, login, getCurrentUser };
