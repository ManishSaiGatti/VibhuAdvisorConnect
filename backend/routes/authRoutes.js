const express = require('express');
const { 
  login, 
  protected, 
  adminDashboard, 
  lpDashboard, 
  companyDashboard 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Authentication routes
router.post('/login', login);
router.get('/protected', authMiddleware, protected);

// Role-specific dashboard routes
router.get('/dashboard/admin', authMiddleware, requireRole('Admin'), adminDashboard);
router.get('/dashboard/lp', authMiddleware, requireRole('LP'), lpDashboard);
router.get('/dashboard/company', authMiddleware, requireRole('Company'), companyDashboard);

// Generic dashboard route that redirects based on role
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