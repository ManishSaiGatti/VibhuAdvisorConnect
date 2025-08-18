/**
 * AuthController - Authentication and Authorization Management
 * 
 * This controller handles user authentication, JWT token generation, and provides
 * role-specific dashboard data for the VibhuAdvisorConnect platform.
 * 
 * Key Responsibilities:
 * - User login and JWT token generation
 * - Role-based dashboard data aggregation
 * - Session management and authentication verification
 * 
 * Authentication Flow:
 * 1. User submits email/password via login endpoint
 * 2. Credentials validated against user database
 * 3. JWT token generated with user info and role
 * 4. Frontend stores token and uses for subsequent API calls
 * 5. Role-specific dashboards provide customized data views
 * 
 * Security Features:
 * - Password validation (note: consider hashing in production)
 * - JWT token with expiration
 * - Role-based access control
 * - Last login tracking
 * 
 * Routes served: /api/auth/* (defined in routes/authRoutes.js)
 */

const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const dataService = require('../services/dataService');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==================== AUTHENTICATION ====================

/**
 * User login endpoint
 * 
 * Endpoint: POST /api/auth/login
 * Required Role: None (public endpoint)
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body.email - User email address
 * @param {Object} req.body.password - User password
 * @param {Object} res - Express response object
 * 
 * Response: JWT token and user information (excluding password)
 * Used by: Frontend login form, mobile app authentication
 * 
 * Security notes:
 * - Validates credentials against database
 * - Updates lastLogin timestamp
 * - Returns JWT token valid for 1 hour
 * - Password stored in plain text (consider bcrypt for production)
 * 
 * Token contains: user ID, email, role, and display name
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await dataService.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login timestamp
    await dataService.updateUser(user.id, { 
      lastLogin: new Date().toISOString().split('T')[0] 
    });

    // Generate JWT token with user information
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: `${user.firstName} ${user.lastName}` 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    // Return token and safe user data (no password)
    res.json({ 
      token, 
      user: { 
        id: user.id,
        email: user.email, 
        role: user.role, 
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Google OAuth Login endpoint
 * 
 * Endpoint: POST /api/auth/google/login
 * Required Role: None (public endpoint)
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body.credential - Google ID token from frontend
 * @param {Object} res - Express response object
 * 
 * Response: JWT token and user information or setup flag for new users
 */
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  
  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await dataService.getUserByEmail(email);
    
    if (user) {
      // Existing user - generate JWT and login
      await dataService.updateUser(user.id, { 
        lastLogin: new Date().toISOString().split('T')[0] 
      });

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          name: `${user.firstName} ${user.lastName}` 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );
      
      res.json({ 
        token, 
        user: { 
          id: user.id,
          email: user.email, 
          role: user.role, 
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName
        },
        isNewUser: false
      });
    } else {
      // New user - return Google user data for setup
      res.json({
        googleUser: {
          email,
          given_name,
          family_name,
          picture,
          googleId
        },
        isNewUser: true
      });
    }
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

/**
 * Google OAuth Account Setup endpoint
 * 
 * Endpoint: POST /api/auth/google/setup
 * Required Role: None (public endpoint)
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body.googleUser - Google user data
 * @param {Object} req.body.accountType - 'LP' or 'Company'
 * @param {Object} req.body.profileData - User profile information
 * @param {Object} res - Express response object
 * 
 * Response: JWT token and complete user data
 */
exports.googleSetup = async (req, res) => {
  const { googleUser, accountType, profileData } = req.body;
  
  try {
    // Create base user object
    const newUser = {
      email: googleUser.email,
      role: accountType,
      firstName: profileData.firstName || googleUser.given_name,
      lastName: profileData.lastName || googleUser.family_name,
      profilePicture: googleUser.picture || '',
      googleId: googleUser.googleId,
      password: '', // No password for Google OAuth users
      lastLogin: new Date().toISOString().split('T')[0],
      isGoogleUser: true,
      setupComplete: true
    };

    // Add role-specific fields
    if (accountType === 'LP') {
      newUser.headline = profileData.headline || '';
      newUser.bio = profileData.bio || '';
      newUser.linkedinUrl = profileData.linkedinUrl || '';
      newUser.expertiseAreas = profileData.expertiseAreas || [];
      newUser.availableHours = profileData.availableHours || '';
    } else if (accountType === 'Company') {
      newUser.companyName = profileData.companyName || '';
      newUser.website = profileData.website || '';
      newUser.description = profileData.description || '';
      newUser.stage = profileData.stage || '';
      newUser.industry = profileData.industry || '';
    }

    const createdUser = await dataService.createUser(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: createdUser.id, 
        email: createdUser.email, 
        role: createdUser.role, 
        name: `${createdUser.firstName} ${createdUser.lastName}` 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: createdUser.id,
        email: createdUser.email, 
        role: createdUser.role, 
        name: `${createdUser.firstName} ${createdUser.lastName}`,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName
      }
    });
  } catch (error) {
    console.error('Google setup error:', error);
    res.status(500).json({ message: 'Account setup failed' });
  }
};

/**
 * Protected route test endpoint
 * 
 * Endpoint: GET /api/auth/protected
 * Required Role: Any authenticated user
 * 
 * @param {Object} req - Express request object (includes req.user from authMiddleware)
 * @param {Object} res - Express response object
 * 
 * Response: Confirmation message with user data
 * Used by: Testing authentication, verifying token validity
 * 
 * This endpoint is useful for frontend to verify if a stored token is still valid
 */
exports.protected = (req, res) => {
  res.json({ message: 'You accessed a protected route!', user: req.user });
};

// ==================== ROLE-SPECIFIC DASHBOARDS ====================

/**
 * Admin Dashboard - Comprehensive Platform Overview
 * 
 * Endpoint: GET /api/auth/dashboard/admin
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object (includes req.user from authMiddleware)
 * @param {Object} res - Express response object
 * 
 * Response: Admin dashboard data with system-wide metrics
 * Used by: Admin dashboard interface, system monitoring
 * 
 * Provides:
 * - Overall platform statistics (users, opportunities, connections)
 * - Recent activity summaries
 * - Performance metrics
 * - Pending action items
 */
exports.adminDashboard = async (req, res) => {
  try {
    const stats = await dataService.getDashboardStats();
    const recentConnections = await dataService.getConnections();
    
    res.json({ 
      message: 'Welcome to VC Admin Dashboard!', 
      user: req.user,
      totalUsers: stats.totalUsers,
      activeOpportunities: stats.openOpportunities,
      lpAdvisors: stats.activeLPs,
      portfolioCompanies: stats.activeCompanies,
      data: {
        // Portfolio overview
        totalPortfolioCompanies: stats.activeCompanies,
        activeConnections: stats.activeConnections,
        totalLPs: stats.totalLPs,
        
        // Recent activity - show latest 3 connections
        recentConnections: recentConnections
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map(conn => ({
            company: 'Connected Company',
            lp: 'Connected LP',
            expertise: 'Various',
            date: conn.createdAt.split('T')[0]
          })),
        
        // Metrics
        avgConnectionsPerCompany: stats.activeConnections / Math.max(stats.activeCompanies, 1),
        lpEngagementRate: `${Math.round((stats.activeConnections / Math.max(stats.activeLPs, 1)) * 100)}%`,
        successfulExits: 8,
        
        // Pending actions
        pendingMatchRequests: stats.openOpportunities,
        lpApplicationsReview: stats.pendingUsers,
        companyOnboardingQueue: 3
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error loading dashboard' });
  }
};

/**
 * LP Dashboard - Advisory Portal for Limited Partners
 * 
 * Endpoint: GET /api/auth/dashboard/lp
 * Required Role: LP
 * 
 * @param {Object} req - Express request object (includes req.user from authMiddleware)
 * @param {Object} res - Express response object
 * 
 * Response: LP-specific dashboard data
 * Used by: LP dashboard interface, advisory opportunity discovery
 * 
 * Provides:
 * - Current advisory commitments
 * - Available opportunities
 * - Impact metrics
 * - Recommended connections based on expertise
 */
exports.lpDashboard = async (req, res) => {
  try {
    const user = await dataService.getUserById(req.user.id);
    const userConnections = await dataService.getConnectionsByLPId(req.user.id);
    const opportunities = await dataService.getOpportunities();
    
    res.json({ 
      message: 'Welcome to LP Advisory Portal!', 
      user: req.user,
      data: {
        // LP profile
        expertiseAreas: user.expertise || user.expertiseAreas || ['General Business'],
        advisoryCommitments: userConnections.filter(c => c.status === 'active').length,
        availableHours: user.availableHours || 'Not specified',
        
        // Current advisory relationships
        activeAdvisoryRoles: userConnections
          .filter(conn => conn.status === 'active')
          .slice(0, 5)
          .map(conn => ({
            company: 'Advisory Company',
            stage: 'Seed',
            industry: 'Technology',
            monthsAdvising: Math.floor((new Date() - new Date(conn.startDate || conn.createdAt)) / (1000 * 60 * 60 * 24 * 30)),
            nextMeeting: conn.nextMeeting || 'TBD'
          })),
        
        // Opportunities
        newMatchingRequests: opportunities.filter(o => o.status === 'open').length,
        recommendedConnections: opportunities
          .filter(o => o.status === 'open')
          .slice(0, 3)
          .map(opp => ({
            company: opp.companyName || 'Company',
            matchScore: Math.floor(Math.random() * 20) + 80,
            reason: `${(opp.requiredExpertise && opp.requiredExpertise[0]) || 'Business'} expertise needed`
          })),
        
        // Impact metrics
        companiesAdvised: userConnections.length,
        successfulExits: Math.floor(userConnections.length * 0.3),
        averageTimeToNextRound: '8.2 months',
        networkReferrals: Math.floor(userConnections.length * 1.5)
      }
    });
  } catch (error) {
    console.error('LP dashboard error:', error);
    res.status(500).json({ message: 'Server error loading dashboard' });
  }
};

/**
 * Company Dashboard - Startup Advisory Hub
 * 
 * Endpoint: GET /api/auth/dashboard/company
 * Required Role: Company
 * 
 * @param {Object} req - Express request object (includes req.user from authMiddleware)
 * @param {Object} res - Express response object
 * 
 * Response: Company-specific dashboard data
 * Used by: Company dashboard interface, advisory request management
 * 
 * Provides:
 * - Connected advisors and relationships
 * - Posted opportunities and applications
 * - Company progress milestones
 * - Fundraising preparation metrics
 */
exports.companyDashboard = async (req, res) => {
  try {
    const user = await dataService.getUserById(req.user.id);
    const userConnections = await dataService.getConnectionsByCompanyId(req.user.id);
    const opportunities = await dataService.getOpportunities();
    const companyOpportunities = opportunities.filter(o => o.companyId === req.user.id);
    
    res.json({ 
      message: 'Welcome to Startup Advisory Hub!', 
      user: req.user,
      data: {
        // Company profile
        companyStage: user.companyStage || 'Not specified',
        industry: user.industry || 'Technology',
        fundingRaised: user.fundingRaised || 'Not disclosed',
        teamSize: user.teamSize || 'Not specified',
        
        // Current advisors
        connectedAdvisors: userConnections
          .filter(conn => conn.status === 'active')
          .slice(0, 5)
          .map(conn => ({
            name: 'Advisory Expert',
            expertise: 'Business Strategy',
            meetingFrequency: conn.meetingFrequency || 'Monthly',
            lastMeeting: conn.lastMeeting || 'Not scheduled',
            status: 'Active'
          })),
        
        // Advisory needs
        requestedExpertise: companyOpportunities
          .filter(o => o.status === 'open')
          .flatMap(o => o.expertiseNeeded)
          .slice(0, 5),
        pendingMatches: companyOpportunities.filter(o => o.status === 'open').length,
        
        // Progress metrics
        keyMilestones: [
          { milestone: 'MVP Launch', status: 'Completed', date: '2025-06-15' },
          { milestone: 'First Paying Customers', status: 'In Progress', target: '2025-08-30' },
          { milestone: 'Series A Prep', status: 'Planned', target: '2025-12-01' }
        ],
        
        // Advisory impact
        advisoryMeetingsThisMonth: userConnections.filter(c => c.status === 'active').length * 2,
        actionItemsCompleted: Math.floor(userConnections.length * 5),
        networkIntroductions: Math.floor(userConnections.length * 2),
        nextFundraisingTarget: user.companyStage === 'Pre-Seed' ? '$2M Seed' : '$5M Series A'
      }
    });
  } catch (error) {
    console.error('Company dashboard error:', error);
    res.status(500).json({ message: 'Server error loading dashboard' });
  }
};