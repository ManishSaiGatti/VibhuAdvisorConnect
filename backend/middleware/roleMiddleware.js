/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * This middleware provides role-based authorization for the VibhuAdvisorConnect
 * application. It works in conjunction with authMiddleware to ensure that users
 * can only access endpoints appropriate for their role.
 * 
 * The application supports three roles:
 * - Admin: Full system access, user management, system oversight
 * - LP: Limited Partner access, advisory opportunities, applications
 * - Company: Company access, opportunity posting, application management
 * 
 * Usage in Routes:
 * const { requireRole } = require('../middleware/roleMiddleware');
 * 
 * // Single role requirement
 * router.get('/admin-only', authMiddleware, requireRole('Admin'), handler);
 * 
 * // Multiple role requirements (any of the specified roles)
 * router.get('/lp-or-admin', authMiddleware, requireRole('LP', 'Admin'), handler);
 * 
 * Prerequisites:
 * - Must be used AFTER authMiddleware
 * - Requires req.user to be populated with JWT payload
 * - User role must be included in JWT token
 * 
 * Security Features:
 * - Prevents privilege escalation
 * - Clear error messages for debugging
 * - Flexible role checking (supports multiple allowed roles)
 */

/**
 * Create role-based authorization middleware
 * 
 * @param {...string} allowedRoles - List of roles that can access the route
 * @returns {Function} Express middleware function
 * 
 * Example Usage:
 * 
 * // Admin-only route
 * router.delete('/users/:id', authMiddleware, requireRole('Admin'), deleteUser);
 * 
 * // LP or Company route
 * router.get('/profile', authMiddleware, requireRole('LP', 'Company'), getProfile);
 * 
 * // Admin or LP route
 * router.get('/opportunities', authMiddleware, requireRole('Admin', 'LP'), getOpportunities);
 * 
 * The middleware checks if the authenticated user's role is included in the
 * allowedRoles list. If not, it returns a 403 Forbidden response.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    // User has required role, continue to route handler
    next();
  };
};

/**
 * Export the requireRole function for use in route definitions
 * 
 * This function creates middleware that enforces role-based access control.
 * It should be used after authMiddleware in the middleware chain.
 */
module.exports = { requireRole };