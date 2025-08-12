const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  getDashboardData,
  getOpportunities,
  expressInterest
} = require('../controllers/lpController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All LP routes require authentication and LP role
router.use(authMiddleware);
router.use(requireRole('LP'));

// Profile management routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Dashboard and opportunities
router.get('/dashboard', getDashboardData);
router.get('/opportunities', getOpportunities);
router.post('/opportunities/:opportunityId/interest', expressInterest);

module.exports = router;
