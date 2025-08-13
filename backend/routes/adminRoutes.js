/**
 * Admin Routes - System Administration and Management
 * 
 * This module defines all administrative routes for system management.
 * All routes require Admin role authentication and provide full system access.
 * 
 * Route Categories:
 * - Dashboard: System statistics and analytics
 * - User Management: User CRUD operations and status management
 * - Opportunity Management: Full opportunity lifecycle management
 * - Search: Advanced search across users and opportunities
 * - Utilities: Data maintenance and consistency operations
 * 
 * Security: All routes require Admin role via middleware
 * Base Path: /api/admin/*
 */

const express = require('express');
const { 
  getUsers, 
  updateUserStatus, 
  getOpportunities, 
  updateOpportunityStatus, 
  deleteOpportunity,
  createOpportunity,
  getDashboardStats,
  searchUsers,
  searchOpportunities,
  syncApplicantCounts
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// ==================== SECURITY MIDDLEWARE ====================
// All admin routes require authentication and Admin role
router.use(authMiddleware);
router.use(requireRole('Admin'));

// ==================== DASHBOARD & ANALYTICS ====================

/**
 * GET /api/admin/stats
 * Retrieve comprehensive system statistics for admin dashboard
 */
router.get('/stats', getDashboardStats);

// ==================== USER MANAGEMENT ====================

/**
 * GET /api/admin/users
 * Get all users in the system (passwords excluded)
 */
router.get('/users', getUsers);

/**
 * GET /api/admin/users/search?query=term&role=LP&status=active
 * Search users with advanced filtering options
 */
router.get('/users/search', searchUsers);

/**
 * PATCH /api/admin/users/:id/status
 * Update user status (active, inactive, pending)
 */
router.patch('/users/:id/status', updateUserStatus);

// ==================== OPPORTUNITY MANAGEMENT ====================

/**
 * GET /api/admin/opportunities
 * Get all opportunities in the system
 */
router.get('/opportunities', getOpportunities);

/**
 * GET /api/admin/opportunities/search?query=term&status=open
 * Search opportunities with filtering options
 */
router.get('/opportunities/search', searchOpportunities);

/**
 * POST /api/admin/opportunities
 * Create new opportunity (admin can create for any company)
 */
router.post('/opportunities', createOpportunity);

/**
 * PATCH /api/admin/opportunities/:id/status
 * Update opportunity status (open, matched, closed)
 */
router.patch('/opportunities/:id/status', updateOpportunityStatus);

/**
 * DELETE /api/admin/opportunities/:id
 * Delete opportunity from system (hard delete)
 */
router.delete('/opportunities/:id', deleteOpportunity);

// ==================== UTILITY & MAINTENANCE ====================

/**
 * POST /api/admin/sync-applicant-counts
 * Synchronize applicant counts across all opportunities for data consistency
 */
router.post('/sync-applicant-counts', syncApplicantCounts);

module.exports = router;
