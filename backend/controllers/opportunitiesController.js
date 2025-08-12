const dataService = require('../services/dataService');

// Create a new opportunity
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

    // Validation
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

    // Prepare opportunity data to match your schema
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

    // Create the opportunity
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

// Get all opportunities (with optional filtering)
exports.getOpportunities = async (req, res) => {
  try {
    const { status = 'open', expertise, timeCommitment, search, page = 1, limit = 50 } = req.query;
    
    let opportunities = await dataService.getOpportunities();
    
    // Get current user to exclude their own opportunities
    const user = await dataService.getUserById(req.user.id);
    
    // Exclude opportunities from the requesting company (if they are a company)
    if (user && user.role === 'Company') {
      opportunities = opportunities.filter(opp => opp.companyId !== user.id);
    }
    
    // Filter by status if provided
    if (status && status !== 'all') {
      opportunities = opportunities.filter(opp => opp.status === status);
    }
    
    // Filter by expertise if provided
    if (expertise && expertise !== '' && expertise !== 'All') {
      opportunities = opportunities.filter(opp => 
        opp.requiredExpertise && opp.requiredExpertise.some(exp => 
          exp.toLowerCase().includes(expertise.toLowerCase())
        )
      );
    }
    
    // Filter by time commitment if provided
    if (timeCommitment && timeCommitment !== '' && timeCommitment !== 'All') {
      opportunities = opportunities.filter(opp => 
        opp.timeCommitment && opp.timeCommitment.toLowerCase().includes(timeCommitment.toLowerCase())
      );
    }
    
    // Filter by search text if provided
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
    
    // Update applicant count with real-time data from applications
    for (let opportunity of opportunities) {
      const applications = await dataService.getApplicationsByOpportunity(opportunity.id);
      const actualCount = applications.length;
      const currentStoredCount = opportunity.applicantCount || 0;
      
      opportunity.applicantCount = actualCount;
      
      // Also update the stored count if it's different
      if (currentStoredCount !== actualCount) {
        await dataService.updateOpportunity(opportunity.id, { applicantCount: actualCount });
      }
    }
    
    // For LP users, add hasApplied field
    if (user && user.role === 'LP') {
      for (let opp of opportunities) {
        opp.hasApplied = await dataService.hasApplied(user.id, opp.id);
      }
    }
    
    // For the frontend, return the opportunities directly as an array
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ message: 'Server error fetching opportunities' });
  }
};

// Get opportunities posted by the current company
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
    
    // Update applicant count with real-time data from applications
    for (let opportunity of companyOpportunities) {
      const applications = await dataService.getApplicationsByOpportunity(opportunity.id);
      const actualCount = applications.length;
      const currentStoredCount = opportunity.applicantCount || 0;
      
      opportunity.applicantCount = actualCount;
      
      // Also update the stored count if it's different
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

// Get a specific opportunity by ID
exports.getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await dataService.getOpportunityById(id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Don't auto-increment view count here anymore - use dedicated endpoint
    res.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ message: 'Server error fetching opportunity' });
  }
};

// Dedicated endpoint to track opportunity views
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

// Update an opportunity (full edit)
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
    
    // Check if user owns this opportunity
    if (opportunity.companyId !== user.id && user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. You can only update your own opportunities.' });
    }

    // Validation for required fields (same as create)
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

// Patch/update specific fields of an opportunity (mainly for status updates)
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
    
    // Check if user owns this opportunity (companies can only update their own)
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

// Delete an opportunity
exports.deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await dataService.getUserById(req.user.id);
    const opportunity = await dataService.getOpportunityById(id);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    
    // Check if user owns this opportunity
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
