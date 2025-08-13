/**
 * OpportunitiesController - Core Opportunity and Application Management
 * 
 * This controller handles the core functionality for advisory opportunities in the
 * VibhuAdvisorConnect platform. It manages the complete lifecycle of opportunities
 * from creation to application processing.
 * 
 * Key Responsibilities:
 * - Opportunity CRUD operations (Create, Read, Update, Delete)
 * - Application submission and management
 * - View tracking and analytics
 * - Permission-based access control
 * - Real-time applicant count synchronization
 * 
 * User Access Patterns:
 * - Companies: Create, edit, delete their own opportunities; view applications
 * - LPs: Browse opportunities, apply to opportunities, view application status
 * - Admins: Full access to all opportunities and applications
 * 
 * Routes served: /api/opportunities/* (defined in routes/opportunitiesRoutes.js)
 * 
 * Data Flow:
 * 1. Companies post opportunities seeking advisory expertise
 * 2. LPs browse and apply to relevant opportunities
 * 3. Companies review applications and update status
 * 4. System tracks metrics and maintains data consistency
 */

const dataService = require('../services/dataService');

// ==================== OPPORTUNITY CRUD OPERATIONS ====================

/**
 * Create a new advisory opportunity
 * 
 * Endpoint: POST /api/opportunities
 * Required Role: Company
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Opportunity data
 * @param {string} req.body.title - Opportunity title
 * @param {string} req.body.description - Detailed description
 * @param {Array} req.body.requiredExpertise - Array of required expertise areas
 * @param {string} req.body.timeCommitment - Expected time commitment
 * @param {string} req.body.compensation - Compensation details
 * @param {Object} res - Express response object
 * 
 * Response: Created opportunity object with assigned ID
 * Used by: Company opportunity creation form
 * 
 * Features:
 * - Validates all required fields
 * - Associates opportunity with authenticated company
 * - Sets initial status to 'open'
 * - Initializes tracking fields (viewCount, applicantCount)
 * 
 * Validation Rules:
 * - Title and description are required and non-empty
 * - RequiredExpertise must be array with at least one item
 * - TimeCommitment and compensation are required
 */
exports.createOpportunity = async (req, res) => {
  try {
    const { title, description, requiredExpertise, timeCommitment, compensation } = req.body;
    
    console.log('Received opportunity creation request:', req.body); // Debug log
    
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Company') {
      return res.status(403).json({ message: 'Access denied. Company role required.' });
    }

    // Comprehensive field validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!requiredExpertise || !Array.isArray(requiredExpertise) || requiredExpertise.length === 0) {
      return res.status(400).json({ message: 'At least one area of required expertise is needed' });
    }
    if (!timeCommitment || !timeCommitment.trim()) {
      return res.status(400).json({ message: 'Time commitment is required' });
    }
    if (!compensation || !compensation.trim()) {
      return res.status(400).json({ message: 'Compensation details are required' });
    }

    // Prepare opportunity data matching the expected schema
    const opportunityData = {
      title: title.trim(),
      description: description.trim(),
      requiredExpertise: requiredExpertise.filter(exp => exp && exp.trim()),
      timeCommitment: timeCommitment.trim(),
      compensation: compensation.trim(),
      companyId: user.id,
      companyName: user.companyName || `${user.firstName} ${user.lastName}`,
      status: 'open',
      viewCount: 0,
      applicantCount: 0,
      applications: []
    };

    console.log('Opportunity data to be created:', opportunityData); // Debug log

    // Create the opportunity using DataService
    const newOpportunity = await dataService.createOpportunity(opportunityData);

    if (!newOpportunity) {
      return res.status(500).json({ message: 'Failed to create opportunity' });
    }

    console.log('Successfully created opportunity:', newOpportunity.id); // Debug log

    res.status(201).json(newOpportunity);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ message: 'Server error creating opportunity' });
  }
};

/**
 * Get opportunities with filtering and role-based access
 * 
 * Endpoint: GET /api/opportunities?status=open&expertise=Marketing&search=term
 * Required Role: Any authenticated user
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering
 * @param {string} req.query.status - Filter by status (open, matched, closed)
 * @param {string} req.query.expertise - Filter by required expertise
 * @param {string} req.query.timeCommitment - Filter by time commitment
 * @param {string} req.query.search - Search term for title/description/company
 * @param {Object} res - Express response object
 * 
 * Response: Array of opportunity objects (filtered and personalized)
 * Used by: Opportunity browsing page, LP opportunity discovery
 * 
 * Features:
 * - Multi-parameter filtering (status, expertise, time commitment, search)
 * - Excludes company's own opportunities from their view
 * - Real-time applicant count synchronization
 * - For LPs: adds hasApplied flag to each opportunity
 * - Sorts by creation date (newest first)
 * 
 * Access Control:
 * - Companies don't see their own opportunities
 * - All users see public opportunity information
 * - LP-specific data enhancement (application status)
 */
exports.getOpportunities = async (req, res) => {
  try {
    const { status = 'open', expertise, timeCommitment, search, page = 1, limit = 50 } = req.query;
    
    let opportunities = await dataService.getOpportunities();
    
    // Get current user to customize the response
    const user = await dataService.getUserById(req.user.id);
    
    // Exclude opportunities from the requesting company (if they are a company)
    if (user && user.role === 'Company') {
      opportunities = opportunities.filter(opp => opp.companyId !== user.id);
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      opportunities = opportunities.filter(opp => opp.status === status);
    }
    
    // Apply expertise filter
    if (expertise && expertise !== '' && expertise !== 'All') {
      opportunities = opportunities.filter(opp => 
        opp.requiredExpertise && opp.requiredExpertise.some(exp => 
          exp.toLowerCase().includes(expertise.toLowerCase())
        )
      );
    }
    
    // Apply time commitment filter
    if (timeCommitment && timeCommitment !== '' && timeCommitment !== 'All') {
      opportunities = opportunities.filter(opp => 
        opp.timeCommitment && opp.timeCommitment.toLowerCase().includes(timeCommitment.toLowerCase())
      );
    }
    
    // Apply search filter across multiple fields
    if (search && search !== '') {
      const searchLower = search.toLowerCase();
      opportunities = opportunities.filter(opp => 
        (opp.title && opp.title.toLowerCase().includes(searchLower)) ||
        (opp.description && opp.description.toLowerCase().includes(searchLower)) ||
        (opp.companyName && opp.companyName.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by creation date (newest first)
    opportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Sync applicant counts with real-time data from applications
    for (let opportunity of opportunities) {
      const applications = await dataService.getApplicationsByOpportunity(opportunity.id);
      const actualCount = applications.length;
      const currentStoredCount = opportunity.applicantCount || 0;
      
      opportunity.applicantCount = actualCount;
      
      // Update stored count if different (background consistency maintenance)
      if (currentStoredCount !== actualCount) {
        await dataService.updateOpportunity(opportunity.id, { applicantCount: actualCount });
      }
    }
    
    // For LP users, add hasApplied field to help with UI state
    if (user && user.role === 'LP') {
      for (let opp of opportunities) {
        opp.hasApplied = await dataService.hasApplied(user.id, opp.id);
      }
    }
    
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: 'Server error fetching opportunities' });
  }
};

/**
 * Get opportunities posted by the current company
 * 
 * Endpoint: GET /api/opportunities/company
 * Required Role: Company
 * 
 * @param {Object} req - Express request object (includes req.user from authMiddleware)
 * @param {Object} res - Express response object
 * 
 * Response: Array of opportunities posted by the authenticated company
 * Used by: Company opportunity management page, company dashboard
 * 
 * Features:
 * - Returns only opportunities owned by the authenticated company
 * - Real-time applicant count synchronization
 * - Sorted by creation date (newest first)
 * - Full opportunity details for management purposes
 * 
 * Use Cases:
 * - Company viewing their posted opportunities
 * - Managing opportunity status and details
 * - Accessing applications for each opportunity
 */
exports.getCompanyOpportunities = async (req, res) => {
  try {
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Company') {
      return res.status(403).json({ message: 'Access denied. Company role required.' });
    }

    const opportunities = await dataService.getOpportunities();
    const companyOpportunities = opportunities.filter(opp => opp.companyId === user.id);
    
    // Sync applicant count with real-time application data
    for (let opportunity of companyOpportunities) {
      const applications = await dataService.getApplicationsByOpportunity(opportunity.id);
      const actualCount = applications.length;
      const currentStoredCount = opportunity.applicantCount || 0;
      
      opportunity.applicantCount = actualCount;
      
      // Update stored count if different (maintain data consistency)
      if (currentStoredCount !== actualCount) {
        await dataService.updateOpportunity(opportunity.id, { applicantCount: actualCount });
      }
    }
    
    // Sort by creation date (newest first)
    companyOpportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(companyOpportunities);
  } catch (error) {
    console.error('Error fetching company opportunities:', error);
    res.status(500).json({ message: 'Server error fetching company opportunities' });
  }
};

/**
 * Get a specific opportunity by ID
 * 
 * Endpoint: GET /api/opportunities/:id
 * Required Role: Any authenticated user
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.id - Opportunity ID
 * @param {Object} res - Express response object
 * 
 * Response: Single opportunity object with full details
 * Used by: Opportunity detail view, application process
 * 
 * Note: View tracking is handled by separate endpoint for better control
 */
exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await dataService.getOpportunityById(id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    res.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ message: 'Server error fetching opportunity' });
  }
};

// ==================== ANALYTICS & TRACKING ====================

/**
 * Track opportunity view for analytics
 * 
 * Endpoint: POST /api/opportunities/:id/view
 * Required Role: Any authenticated user
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.id - Opportunity ID to track view for
 * @param {Object} res - Express response object
 * 
 * Response: Confirmation with updated view count
 * Used by: Frontend opportunity detail pages for analytics
 * 
 * Features:
 * - Increments view count for opportunity
 * - Separate from opportunity retrieval for better control
 * - Provides analytics data for companies
 * - Can be used to track user engagement patterns
 */
exports.trackOpportunityView = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Received view tracking request for opportunity:', id, 'from user:', req.user.id); // Debug log
    
    const opportunity = await dataService.getOpportunityById(id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Increment view count
    const newViewCount = (opportunity.viewCount || 0) + 1;
    await dataService.updateOpportunity(id, { 
      viewCount: newViewCount 
    });
    
    console.log('Successfully tracked view for opportunity:', id, 'new count:', newViewCount); // Debug log
    
    res.json({ 
      message: 'View tracked successfully',
      viewCount: newViewCount,
      opportunityId: parseInt(id)
    });
  } catch (error) {
    console.error('Error tracking opportunity view:', error);
    res.status(500).json({ message: 'Server error tracking view' });
  }
};

// ==================== OPPORTUNITY UPDATES ====================

/**
 * Update an opportunity (full edit)
 * 
 * Endpoint: PUT /api/opportunities/:id
 * Required Role: Company (owner) or Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.id - Opportunity ID to update
 * @param {Object} req.body - Updated opportunity data
 * @param {string} req.body.title - Updated title
 * @param {string} req.body.description - Updated description
 * @param {Array} req.body.requiredExpertise - Updated expertise requirements
 * @param {string} req.body.timeCommitment - Updated time commitment
 * @param {string} req.body.compensation - Updated compensation details
 * @param {Object} res - Express response object
 * 
 * Response: Updated opportunity object
 * Used by: Company opportunity editing form
 * 
 * Security:
 * - Companies can only edit their own opportunities
 * - Admins can edit any opportunity
 * - Full validation of required fields
 */
exports.updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredExpertise, timeCommitment, compensation } = req.body;
    
    console.log('Received opportunity update request for ID:', id, 'with data:', req.body); // Debug log
    
    const user = await dataService.getUserById(req.user.id);
    const opportunity = await dataService.getOpportunityById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Company') {
      return res.status(403).json({ message: 'Access denied. Company role required.' });
    }
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check ownership (companies can only edit their own opportunities)
    if (opportunity.companyId !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. You can only update your own opportunities.' });
    }

    // Apply same validation as creation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!requiredExpertise || !Array.isArray(requiredExpertise) || requiredExpertise.length === 0) {
      return res.status(400).json({ message: 'At least one area of required expertise is needed' });
    }
    if (!timeCommitment || !timeCommitment.trim()) {
      return res.status(400).json({ message: 'Time commitment is required' });
    }
    if (!compensation || !compensation.trim()) {
      return res.status(400).json({ message: 'Compensation details are required' });
    }

    // Prepare update data
    const updateData = {
      title: title.trim(),
      description: description.trim(),
      requiredExpertise: requiredExpertise.filter(exp => exp && exp.trim()),
      timeCommitment: timeCommitment.trim(),
      compensation: compensation.trim()
    };

    console.log('Opportunity update data to be saved:', updateData); // Debug log
    
    const updatedOpportunity = await dataService.updateOpportunity(id, updateData);
    
    if (!updatedOpportunity) {
      return res.status(500).json({ message: 'Failed to update opportunity' });
    }

    console.log('Successfully updated opportunity:', updatedOpportunity.id); // Debug log
    
    res.json(updatedOpportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ message: 'Server error updating opportunity' });
  }
};

/**
 * Patch/update specific fields of an opportunity
 * 
 * Endpoint: PATCH /api/opportunities/:id
 * Required Role: Company (owner) or Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.id - Opportunity ID to update
 * @param {Object} req.body - Fields to update (partial update)
 * @param {Object} res - Express response object
 * 
 * Response: Updated opportunity object
 * Used by: Status updates, quick field changes
 * 
 * Common use cases:
 * - Changing opportunity status (open → closed)
 * - Updating view counts
 * - Modifying priority levels
 */
exports.patchOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Received patch request for opportunity:', id, 'with updates:', updates); // Debug log
    
    const user = await dataService.getUserById(req.user.id);
    const opportunity = await dataService.getOpportunityById(id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check ownership (companies can only update their own opportunities)
    if (opportunity.companyId !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. You can only update your own opportunities.' });
    }
    
    // Validate status if it's being updated
    if (updates.status && !['open', 'closed', 'filled'].includes(updates.status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: open, closed, filled' });
    }
    
    const updatedOpportunity = await dataService.updateOpportunity(id, updates);
    
    if (!updatedOpportunity) {
      return res.status(500).json({ message: 'Failed to update opportunity' });
    }
    
    console.log('Successfully patched opportunity:', updatedOpportunity.id); // Debug log
    
    res.json(updatedOpportunity);
  } catch (error) {
    console.error('Error patching opportunity:', error);
    res.status(500).json({ message: 'Server error updating opportunity' });
  }
};

/**
 * Delete an opportunity
 * 
 * Endpoint: DELETE /api/opportunities/:id
 * Required Role: Company (owner) or Admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params.id - Opportunity ID to delete
 * @param {Object} res - Express response object
 * 
 * Response: Confirmation message
 * Used by: Company opportunity management, admin cleanup
 * 
 * Security:
 * - Companies can only delete their own opportunities
 * - Admins can delete any opportunity
 * - Hard delete (consider soft delete for production)
 */
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await dataService.getUserById(req.user.id);
    const opportunity = await dataService.getOpportunityById(id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check ownership (companies can only delete their own opportunities)
    if (opportunity.companyId !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own opportunities.' });
    }
    
    const deleted = await dataService.deleteOpportunity(id);
    
    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete opportunity' });
    }
    
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ message: 'Server error deleting opportunity' });
  }
};

// Apply to an opportunity (LP users only)
exports.applyToOpportunity = async (req, res) => {
  try {
    const { id: opportunityId } = req.params;
    
    console.log('Received application request for opportunity:', opportunityId, 'from user:', req.user.id); // Debug log
    
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'LP') {
      return res.status(403).json({ message: 'Access denied. Only LP users can apply to opportunities.' });
    }

    const opportunity = await dataService.getOpportunityById(opportunityId);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.status !== 'open') {
      return res.status(400).json({ message: 'This opportunity is not open for applications' });
    }

    // Check if user has already applied
    const hasApplied = await dataService.hasApplied(user.id, opportunityId);
    if (hasApplied) {
      return res.status(400).json({ message: 'You have already applied to this opportunity' });
    }

    // Create application
    const applicationData = {
      lpId: user.id,
      lpName: `${user.firstName} ${user.lastName}`,
      lpEmail: user.email,
      opportunityId: parseInt(opportunityId),
      opportunityTitle: opportunity.title,
      companyId: opportunity.companyId,
      companyName: opportunity.companyName
    };

    const newApplication = await dataService.createApplication(applicationData);
    
    if (!newApplication) {
      return res.status(500).json({ message: 'Failed to submit application' });
    }

    // Sync the applicant count with the actual number of applications
    await dataService.syncOpportunityApplicantCount(opportunityId);

    console.log('Successfully created application:', newApplication.id); // Debug log

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: newApplication.id
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
};

// Get applications for a specific opportunity (Company owners only)
exports.getOpportunityApplications = async (req, res) => {
  try {
    const { id: opportunityId } = req.params;
    
    console.log('Received request for applications for opportunity:', opportunityId, 'from user:', req.user.id); // Debug log
    
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Company' && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Company role required.' });
    }

    const opportunity = await dataService.getOpportunityById(opportunityId);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if user owns this opportunity (or is admin)
    if (opportunity.companyId !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. You can only view applications for your own opportunities.' });
    }

    // Get applications for this opportunity
    const applications = await dataService.getApplicationsByOpportunity(opportunityId);
    
    // Sort by creation date (newest first)
    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('Successfully retrieved', applications.length, 'applications for opportunity:', opportunityId); // Debug log

    res.json(applications);
  } catch (error) {
    console.error('Error fetching opportunity applications:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// Update application status (Company owners only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const { status } = req.body;
    
    console.log('Received request to update application:', applicationId, 'to status:', status, 'from user:', req.user.id); // Debug log
    
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Company' && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Company role required.' });
    }

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: pending, reviewed, accepted, rejected' });
    }

    // Get the application
    const applications = await dataService.getApplications();
    const application = applications.find(app => app.id === parseInt(applicationId));
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the company owns the opportunity associated with this application
    const opportunity = await dataService.getOpportunityById(application.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: 'Associated opportunity not found' });
    }

    if (opportunity.companyId !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. You can only update applications for your own opportunities.' });
    }

    // Update the application
    const updatedApplication = await dataService.updateApplication(applicationId, { status });
    
    if (!updatedApplication) {
      return res.status(500).json({ message: 'Failed to update application' });
    }

    console.log('Successfully updated application:', updatedApplication.id, 'to status:', status); // Debug log

    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Server error updating application' });
  }
};
