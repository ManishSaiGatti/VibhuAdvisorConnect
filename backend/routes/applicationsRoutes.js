const express = require('express');
const { updateApplicationStatus } = require('../controllers/opportunitiesController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All application routes require authentication
router.use(authMiddleware);

// Update application status
router.patch('/:applicationId', updateApplicationStatus);

module.exports = router;
