const express = require('express');
const { 
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  patchOpportunity,
  deleteOpportunity,
  applyToOpportunity,
  getOpportunityApplications,
  updateApplicationStatus,
  trackOpportunityView
} = require('../controllers/opportunitiesController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All opportunities routes require authentication
router.use(authMiddleware);

// Public opportunity routes (accessible by all authenticated users)
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// View tracking route (accessible by all authenticated users)
router.post('/:id/view', trackOpportunityView);

// LP-only routes
router.post('/:id/apply', applyToOpportunity);

// Company-only routes (create, update, delete opportunities)
router.post('/', createOpportunity);
router.put('/:id', updateOpportunity);
router.patch('/:id', patchOpportunity);
router.delete('/:id', deleteOpportunity);

// Company-only application management routes
router.get('/:id/applications', getOpportunityApplications);
router.patch('/applications/:applicationId', updateApplicationStatus);

module.exports = router;
