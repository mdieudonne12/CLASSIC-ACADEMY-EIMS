// Classic Academy EIMS - JWT Authentication Middleware
const jwt = require('jsonwebtoken');

// Helper to get JWT secret (fallback value for dev convenience)
const JWT_SECRET = process.env.JWT_SECRET || 'classic_academy_secret_token_key_12345';

// Authenticate JWT Token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. Authorization token missing.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Invalid or expired token.' 
    });
  }
}

// Authorize roles middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized. User authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.` 
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET
};
