/**
 * AdminController - Administrative Management Functions
 * 
 * This controller handles all administrative functions for the VibhuAdvisorConnect platform.
 * It provides endpoints for system administrators to manage users, opportunities, 
 * applications, and generate system-wide analytics.
 * 
 * All endpoints in this controller require Admin role authentication via middleware.
 * 
 * Key Responsibilities:
 * - User management (view, update status, search)
 * - Opportunity oversight and management
 * - System analytics and dashboard statistics
 * - Data consistency maintenance (applicant count syncing)
 * 
 * Security: All endpoints require Admin role verification through roleMiddleware
 * 
 * Routes served: /api/admin/* (defined in routes/adminRoutes.js)
 */

const dataService = require('../services/dataService');

// ==================== USER MANAGEMENT ====================

/**
 * Get all users in the system (excluding passwords)
 * 
 * Endpoint: GET /api/admin/users
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Response: Array of user objects without password fields
 * Used by: Admin user management interface
 * 
 * Features:
 * - Removes password field from all user objects for security
 * - Returns all users regardless of role or status
 * - Includes user statistics and metadata
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await dataService.getUsers();
    // Remove passwords from response for security
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

/**
 * Update user status (active, inactive, pending)
 * 
 * Endpoint: PATCH /api/admin/users/:id/status
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.id - User ID to update
 * @param {Object} req.body.status - New status value
 * @param {Object} res - Express response object
 * 
 * Valid status values: 'active', 'inactive', 'pending'
 * Used by: Admin user management, account approval workflow
 * 
 * Use cases:
 * - Activating pending user registrations
 * - Suspending problematic users
 * - Managing user lifecycle
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status value
    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "active", "inactive", or "pending"' });
    }
    
    // Update user status using DataService
    const updatedUser = await dataService.updateUser(id, { status });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response for security
    const { password, ...safeUser } = updatedUser;
    res.json({ 
      message: 'User status updated successfully', 
      user: safeUser 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
};

// ==================== OPPORTUNITY MANAGEMENT ====================

/**
 * Get all opportunities in the system
 * 
 * Endpoint: GET /api/admin/opportunities
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Response: Array of all opportunity objects
 * Used by: Admin opportunity oversight, system monitoring
 * 
 * Provides full visibility into all opportunities regardless of status or company
 */
exports.getOpportunities = async (req, res) => {
  try {
    const opportunities = await dataService.getOpportunities();
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
};

/**
 * Update opportunity status (open, matched, closed)
 * 
 * Endpoint: PATCH /api/admin/opportunities/:id/status
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.id - Opportunity ID to update
 * @param {Object} req.body.status - New status value
 * @param {Object} res - Express response object
 * 
 * Valid status values: 'open', 'matched', 'closed'
 * Used by: Admin opportunity management, workflow oversight
 * 
 * Use cases:
 * - Manually closing inactive opportunities
 * - Managing opportunity lifecycle
 * - Correcting status inconsistencies
 */
exports.updateOpportunityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status value
    if (!['open', 'matched', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "open", "matched", or "closed"' });
    }
    
    // Update opportunity status using DataService
    const updatedOpportunity = await dataService.updateOpportunity(id, { status });
    if (!updatedOpportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.json({ 
      message: 'Opportunity status updated successfully', 
      opportunity: updatedOpportunity 
    });
  } catch (error) {
    console.error('Error updating opportunity status:', error);
    res.status(500).json({ message: 'Failed to update opportunity status', error: error.message });
  }
};

/**
 * Delete an opportunity from the system
 * 
 * Endpoint: DELETE /api/admin/opportunities/:id
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.id - Opportunity ID to delete
 * @param {Object} res - Express response object
 * 
 * Warning: This is a hard delete operation
 * Used by: Admin cleanup, removing inappropriate content
 * 
 * Consider: Implementing soft delete (status = 'deleted') for data integrity
 */
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete opportunity using DataService
    const deleted = await dataService.deleteOpportunity(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.json({ 
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ message: 'Failed to delete opportunity', error: error.message });
  }
};

/**
 * Create a new opportunity (admin can create for any company)
 * 
 * Endpoint: POST /api/admin/opportunities
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Opportunity data
 * @param {Object} res - Express response object
 * 
 * Required fields: title, companyName, description
 * Optional fields: expertiseNeeded, timeCommitment, compensationType, priority
 * 
 * Used by: Admin opportunity creation, system seeding, testing
 * 
 * Note: Admin can create opportunities for any company, unlike company users
 * who can only create for their own company
 */
exports.createOpportunity = async (req, res) => {
  try {
    const { title, companyName, description, expertiseNeeded, timeCommitment, compensationType, priority } = req.body;
    
    // Validate required fields
    if (!title || !companyName || !description) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, companyName, description' 
      });
    }
    
    // Create new opportunity using DataService
    const newOpportunity = await dataService.createOpportunity({
      title,
      companyName,
      description,
      expertiseNeeded: expertiseNeeded || [],
      timeCommitment: timeCommitment || 'Not specified',
      compensationType: compensationType || 'Equity',
      priority: priority || 'medium',
      companyId: req.user.role === 'Company' ? req.user.id : null
    });
    
    res.status(201).json({ 
      message: 'Opportunity created successfully', 
      opportunity: newOpportunity 
    });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ message: 'Failed to create opportunity', error: error.message });
  }
};

// ==================== SYSTEM ANALYTICS ====================

/**
 * Get comprehensive dashboard statistics
 * 
 * Endpoint: GET /api/admin/dashboard/stats
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Response: Object containing system-wide metrics
 * Used by: Admin dashboard, system monitoring, reporting
 * 
 * Metrics include:
 * - User counts by role and status
 * - Opportunity statistics
 * - Connection metrics
 * - Platform health indicators
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await dataService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics', error: error.message });
  }
};

// ==================== SEARCH & FILTERING ====================

/**
 * Search users with advanced filtering options
 * 
 * Endpoint: GET /api/admin/search/users?query=term&role=LP&status=active
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.query.query - Search term for name/email/company
 * @param {Object} req.query.role - Filter by role (LP, Company, Admin)
 * @param {Object} req.query.status - Filter by status (active, inactive, pending)
 * @param {Object} res - Express response object
 * 
 * Response: Array of matching user objects (passwords excluded)
 * Used by: Admin user search interface, user discovery
 * 
 * Search capabilities:
 * - Text search across firstName, lastName, email, companyName
 * - Role-based filtering
 * - Status-based filtering
 * - Case-insensitive matching
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query, role, status } = req.query;
    const users = await dataService.searchUsers(query, role, status);
    
    // Remove passwords from response for security
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
};

/**
 * Search opportunities with filtering options
 * 
 * Endpoint: GET /api/admin/search/opportunities?query=term&status=open
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.query.query - Search term for title/company/description
 * @param {Object} req.query.status - Filter by status (open, matched, closed)
 * @param {Object} res - Express response object
 * 
 * Response: Array of matching opportunity objects
 * Used by: Admin opportunity search, content moderation
 * 
 * Search capabilities:
 * - Text search across title, companyName, description
 * - Status-based filtering
 * - Case-insensitive matching
 */
exports.searchOpportunities = async (req, res) => {
  try {
    const { query, status } = req.query;
    const opportunities = await dataService.searchOpportunities(query, status);
    res.json(opportunities);
  } catch (error) {
    console.error('Error searching opportunities:', error);
    res.status(500).json({ message: 'Failed to search opportunities', error: error.message });
  }
};

// ==================== DATA MAINTENANCE ====================

/**
 * Synchronize applicant counts across all opportunities
 * 
 * Endpoint: POST /api/admin/sync/applicant-counts
 * Required Role: Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Response: Object containing sync results for each opportunity
 * Used by: Data maintenance, fixing count inconsistencies
 * 
 * This function ensures that the applicantCount field in each opportunity
 * matches the actual number of applications in the applications.json file.
 * 
 * Useful for:
 * - Fixing data inconsistencies
 * - Regular maintenance tasks
 * - Post-migration data cleanup
 */
exports.syncApplicantCounts = async (req, res) => {
  try {
    const opportunities = await dataService.getOpportunities();
    const syncResults = [];
    
    // Process each opportunity and sync its applicant count
    for (let opportunity of opportunities) {
      const actualCount = await dataService.syncOpportunityApplicantCount(opportunity.id);
      syncResults.push({
        id: opportunity.id,
        title: opportunity.title,
        previousCount: opportunity.applicantCount || 0,
        actualCount: actualCount
      });
    }
    
    res.json({ 
      message: 'Successfully synced applicant counts for all opportunities',
      results: syncResults
    });
  } catch (error) {
    console.error('Error syncing applicant counts:', error);
    res.status(500).json({ message: 'Failed to sync applicant counts', error: error.message });
  }
};
