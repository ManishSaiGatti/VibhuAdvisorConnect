/**
 * Authentication Middleware - JWT Token Verification
 * 
 * This middleware function verifies JWT tokens for protected routes in the
 * VibhuAdvisorConnect application. It extracts the token from the Authorization
 * header, validates it against the JWT secret, and adds user information to
 * the request object for use in subsequent middleware and route handlers.
 * 
 * Usage in Routes:
 * const authMiddleware = require('../middleware/authMiddleware');
 * router.get('/protected-route', authMiddleware, (req, res) => {
 *   // req.user contains decoded JWT payload
 *   console.log(req.user.id, req.user.role);
 * });
 * 
 * Token Format Expected:
 * Authorization: Bearer <jwt-token>
 * 
 * JWT Payload Contains:
 * - id: User ID
 * - email: User email
 * - role: User role (Admin, LP, Company)
 * - name: User display name
 * 
 * Security Features:
 * - Validates token signature using JWT_SECRET
 * - Checks token expiration
 * - Protects against malformed tokens
 * - Returns appropriate error responses
 * 
 * Error Responses:
 * - 401: Missing or malformed Authorization header
 * - 403: Invalid or expired token
 */

const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware Function
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next middleware function
 * 
 * Validates JWT token and adds user data to request object.
 * Used by all protected routes requiring authentication.
 * 
 * Sets req.user with decoded token payload on success.
 * Returns error response on authentication failure.
 */
module.exports = (req, res, next) => {
  // Extract Authorization header
  const authHeader = req.headers.authorization;
  
  // Check for Bearer token format
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token signature and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user information to request object for use in route handlers
    req.user = decoded;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Token verification failed (invalid signature, expired, malformed)
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
