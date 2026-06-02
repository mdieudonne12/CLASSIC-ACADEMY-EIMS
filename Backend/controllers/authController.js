// Classic Academy EIMS - Authentication Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// User Login Controller
async function login(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required.' 
    });
  }

  try {
    // Query user by username
    const [users] = await db.query(
      'SELECT u.*, e.first_name, e.last_name, e.avatar_url, e.position FROM users u LEFT JOIN employees e ON u.employee_id = e.employee_id WHERE u.username = ?', 
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password.' 
      });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password.' 
      });
    }

    // Generate JWT
    const payload = {
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      employee_id: user.employee_id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        first_name: user.first_name || 'Admin',
        last_name: user.last_name || 'User',
        position: user.position || 'System Administrator',
        avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      }
    });

  } catch (error) {
    next(error);
  }
}

// User Registration Controller
async function register(req, res, next) {
  const { username, password, email, role, employee_id } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username, password, and email are required.' 
    });
  }

  try {
    // Check if user or email already exists
    const [existing] = await db.query(
      'SELECT username, email FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      const match = existing[0];
      const conflict = match.username === username ? 'Username' : 'Email';
      return res.status(409).json({ 
        success: false, 
        message: `${conflict} is already registered.` 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (username, password_hash, email, role, employee_id) VALUES (?, ?, ?, ?, ?)',
      [username, passwordHash, email, role || 'Employee', employee_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'User account registered successfully.',
      user_id: result.insertId
    });

  } catch (error) {
    next(error);
  }
}

// Get Logged In User Profile Controller
async function getMe(req, res, next) {
  try {
    const [users] = await db.query(
      'SELECT u.user_id, u.username, u.email, u.role, u.employee_id, e.first_name, e.last_name, e.position, e.avatar_url FROM users u LEFT JOIN employees e ON u.employee_id = e.employee_id WHERE u.user_id = ?',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User account not found.' 
      });
    }

    const user = users[0];
    return res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        first_name: user.first_name || 'Admin',
        last_name: user.last_name || 'User',
        position: user.position || 'System Administrator',
        avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  getMe
};
