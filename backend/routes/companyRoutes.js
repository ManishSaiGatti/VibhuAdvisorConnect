const express = require('express');
const { 
  getProfile, 
  updateProfile,
  getOpportunities
} = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All Company routes require authentication and Company role
router.use(authMiddleware);
router.use(requireRole('Company'));

// Profile management routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Company-specific opportunity routes
router.get('/opportunities', getOpportunities);

module.exports = router;
