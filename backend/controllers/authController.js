const jwt = require('jsonwebtoken');
const dataService = require('../services/dataService');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await dataService.getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await dataService.updateUser(user.id, { 
      lastLogin: new Date().toISOString().split('T')[0] 
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` }, 
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
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.protected = (req, res) => {
  res.json({ message: 'You accessed a protected route!', user: req.user });
};

// Dashboard endpoints for each user type
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