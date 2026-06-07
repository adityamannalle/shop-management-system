const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * AUTHENTICATION MIDDLEWARE
 * Verifies the JWT from the Authorization header.
 */
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        console.error('[AuthMiddleware Error]: No Token Provided in headers.');
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_here');
        console.log('[AuthMiddleware]: Token verified for User ID:', decoded.id);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('[AuthMiddleware Error]: Token Validation Failed:', err.message);
        return res.status(403).json({ message: 'Access Denied: Invalid Token' });
    }
};

/**
 * AUTHORIZATION MIDDLEWARE
 * Restricts routes based on user role.
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Forbidden: Only ${roles.join(' or ')} can access this resource.` 
            });
        }
        next();
    };
};

module.exports = { authenticateJWT, authorizeRoles };
