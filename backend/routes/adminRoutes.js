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

// All admin routes require authentication and Admin role
router.use(authMiddleware);
router.use(requireRole('Admin'));

// Dashboard statistics
router.get('/stats', getDashboardStats);

// User management routes
router.get('/users', getUsers);
router.get('/users/search', searchUsers);
router.patch('/users/:id/status', updateUserStatus);

// Opportunity management routes
router.get('/opportunities', getOpportunities);
router.get('/opportunities/search', searchOpportunities);
router.post('/opportunities', createOpportunity);
router.patch('/opportunities/:id/status', updateOpportunityStatus);
router.delete('/opportunities/:id', deleteOpportunity);

// Utility routes
router.post('/sync-applicant-counts', syncApplicantCounts);

module.exports = router;
