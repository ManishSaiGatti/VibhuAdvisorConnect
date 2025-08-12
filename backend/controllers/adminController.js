const dataService = require('../services/dataService');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await dataService.getUsers();
    // Remove passwords from response
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

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'inactive', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "active", "inactive", or "pending"' });
    }
    
    // Update user status
    const updatedUser = await dataService.updateUser(id, { status });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
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

// Get all opportunities
exports.getOpportunities = async (req, res) => {
  try {
    const opportunities = await dataService.getOpportunities();
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: 'Failed to fetch opportunities', error: error.message });
  }
};

// Update opportunity status
exports.updateOpportunityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['open', 'matched', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "open", "matched", or "closed"' });
    }
    
    // Update opportunity status
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

// Delete opportunity
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete opportunity
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

// Create new opportunity
exports.createOpportunity = async (req, res) => {
  try {
    const { title, companyName, description, expertiseNeeded, timeCommitment, compensationType, priority } = req.body;
    
    // Validate required fields
    if (!title || !companyName || !description) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, companyName, description' 
      });
    }
    
    // Create new opportunity
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

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await dataService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics', error: error.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query, role, status } = req.query;
    const users = await dataService.searchUsers(query, role, status);
    
    // Remove passwords from response
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

// Search opportunities
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

// Sync all opportunity applicant counts with actual applications
exports.syncApplicantCounts = async (req, res) => {
  try {
    const opportunities = await dataService.getOpportunities();
    const syncResults = [];
    
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
