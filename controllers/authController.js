const pool = require('../db');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

// Register user
const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, full_name, email',
      [full_name, email, password_hash]
    );

    const user = result.rows[0];
    const token = generateToken(user.user_id);

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
    console.error('Register Error Details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Full Error:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message // Remove this in production
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Compare passwords
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    await pool.query(
      'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    await pool.query(
      `UPDATE dead_mans_switch
       SET
         last_checkin = CURRENT_TIMESTAMP,
         status = 'active',
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [user.user_id]
    );

    // Generate token
    const token = generateToken(user.user_id);

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
    console.error('Login Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user (authenticated)
const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, full_name, email FROM users WHERE user_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
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
    console.error('Get User Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { register, login, getCurrentUser };
