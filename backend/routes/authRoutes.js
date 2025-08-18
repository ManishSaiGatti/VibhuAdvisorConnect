/**
 * Authentication Routes - Login and Role-Based Dashboard Access
 * 
 * This module defines all authentication-related routes for the VibhuAdvisorConnect
 * platform. It handles user login, token verification, and provides role-specific
 * dashboard endpoints.
 * 
 * Route Structure:
 * - POST /api/auth/login - User authentication
 * - GET /api/auth/protected - Token verification test
 * - GET /api/auth/dashboard - Generic dashboard (redirects based on role)
 * - GET /api/auth/dashboard/admin - Admin-specific dashboard
 * - GET /api/auth/dashboard/lp - LP-specific dashboard  
 * - GET /api/auth/dashboard/company - Company-specific dashboard
 * 
 * Security:
 * - Public: /login endpoint only
 * - Protected: All other endpoints require valid JWT token
 * - Role-based: Dashboard endpoints enforce specific role requirements
 * 
 * Used by: Frontend authentication flow, dashboard loading
 */

const express = require('express');
const { 
  login, 
  googleLogin,
  googleSetup,
  protected, 
  adminDashboard, 
  lpDashboard, 
  companyDashboard 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// ==================== PUBLIC AUTHENTICATION ROUTES ====================

/**
 * User login endpoint
 * POST /api/auth/login
 * 
 * Body: { email: string, password: string }
 * Response: { token: string, user: object }
 * 
 * Validates credentials and returns JWT token for authenticated sessions
 */
router.post('/login', login);

/**
 * Google OAuth login endpoint
 * POST /api/auth/google/login
 * 
 * Body: { credential: string }
 * Response: { token: string, user: object } or { googleUser: object, isNewUser: true }
 * 
 * Verifies Google ID token and either logs in existing user or flags for setup
 */
router.post('/google/login', googleLogin);

/**
 * Google OAuth account setup endpoint
 * POST /api/auth/google/setup
 * 
 * Body: { googleUser: object, accountType: string, profileData: object }
 * Response: { token: string, user: object }
 * 
 * Creates new user account from Google OAuth data and profile setup
 */
router.post('/google/setup', googleSetup);

// ==================== PROTECTED ROUTES ====================

/**
 * Token verification test endpoint
 * GET /api/auth/protected
 * 
 * Headers: Authorization: Bearer <token>
 * Response: { message: string, user: object }
 * 
 * Verifies JWT token validity and returns user information
 */
router.get('/protected', authMiddleware, protected);

// ==================== ROLE-SPECIFIC DASHBOARD ROUTES ====================

/**
 * Admin dashboard with system-wide metrics
 * GET /api/auth/dashboard/admin
 * 
 * Required Role: Admin
 * Response: Complete system analytics and management data
 */
router.get('/dashboard/admin', authMiddleware, requireRole('Admin'), adminDashboard);

/**
 * LP dashboard with advisory opportunities and connections
 * GET /api/auth/dashboard/lp
 * 
 * Required Role: LP
 * Response: LP-specific dashboard with opportunities and impact metrics
 */
router.get('/dashboard/lp', authMiddleware, requireRole('LP'), lpDashboard);

/**
 * Company dashboard with posted opportunities and advisor connections
 * GET /api/auth/dashboard/company
 * 
 * Required Role: Company
 * Response: Company-specific dashboard with advisory needs and progress
 */
router.get('/dashboard/company', authMiddleware, requireRole('Company'), companyDashboard);

/**
 * Generic dashboard route with automatic role-based redirection
 * GET /api/auth/dashboard
 * 
 * Redirects to appropriate role-specific dashboard based on user's role
 * Provides a single endpoint for frontend to fetch dashboard data
 */
router.get('/dashboard', authMiddleware, (req, res) => {
  const { role } = req.user;
  
  switch (role) {
    case 'Admin':
      return res.redirect('/api/auth/dashboard/admin');
    case 'LP':
      return res.redirect('/api/auth/dashboard/lp');
    case 'Company':
      return res.redirect('/api/auth/dashboard/company');
    default:
      return res.status(403).json({ message: 'Invalid user role' });
  }
});

module.exports = router;