/**
 * CompanyController - Company-Specific Profile and Opportunity Management
 * 
 * This controller handles company-specific functionality in the VibhuAdvisorConnect
 * platform. It provides endpoints for companies to manage their profiles and
 * view their posted opportunities.
 * 
 * Key Responsibilities:
 * - Company profile management (view and update)
 * - Company opportunity retrieval and management
 * - Data transformation between user records and company profile format
 * 
 * All endpoints require Company role authentication via middleware.
 * Companies can only access and modify their own data.
 * 
 * Routes served: /api/company/* (defined in routes/companyRoutes.js)
 * 
 * Data Model Note:
 * Company information is stored in the users table with role='Company'
 * This controller transforms user data into company profile format for frontend
 */

const dataService = require('../services/dataService');

// ==================== PROFILE MANAGEMENT ====================

/**
 * Get company profile information
 * 
 * Endpoint: GET /api/company/profile
 * Required Role: Company
 * 
 * @param {Object} req - Express request object (includes req.user from authMiddleware)
 * @param {Object} res - Express response object
 * 
 * Response: Company profile object with company-specific fields
 * Used by: Company profile page, profile editing form pre-population
 * 
 * Data Transformation:
 * - Maps user fields to company profile structure
 * - Handles field name variations (stage vs companyStage)
 * - Provides fallback values for missing fields
 * - Excludes sensitive information (passwords, internal IDs)
 * 
 * Security:
 * - Verifies user exists and has Company role
 * - Only returns data for the authenticated company
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Company') {
      return res.status(403).json({ message: 'Access denied. Company role required.' });
    }

    // Map user fields to company profile structure expected by frontend
    const profile = {
      id: user.id,
      userId: user.id,
      companyName: user.companyName || '',
      website: user.website || '',
      description: user.description || '',
      stage: user.stage || user.companyStage || '', // Handle both field names
      industry: user.industry || '',
      createdAt: user.createdAt || user.joinedDate,
      updatedAt: user.updatedAt || user.joinedDate
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

/**
 * Update company profile information
 * 
 * Endpoint: PUT /api/company/profile
 * Required Role: Company
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Updated profile data
 * @param {string} req.body.companyName - Company name
 * @param {string} req.body.website - Company website URL
 * @param {string} req.body.description - Company description
 * @param {string} req.body.stage - Company stage (Seed, Series A, etc.)
 * @param {string} req.body.industry - Company industry
 * @param {Object} res - Express response object
 * 
 * Response: Updated company profile object
 * Used by: Company profile editing form submission
 * 
 * Features:
 * - Validates website URL format if provided
 * - Handles undefined/null values gracefully
 * - Updates both current and legacy field names for compatibility
 * - Returns transformed profile data for frontend consumption
 * 
 * Validation:
 * - Website must start with http:// or https://
 * - All fields are optional (can be empty strings)
 * - Verifies user has Company role
 */
exports.updateProfile = async (req, res) => {
  try {
    const { companyName, website, description, stage, industry } = req.body;
    
    console.log('Received company profile update request:', req.body); // Debug log
    
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Company') {
      return res.status(403).json({ message: 'Access denied. Company role required.' });
    }

    // Validate website URL if provided
    if (website && website.trim() && !website.match(/^https?:\/\//)) {
      return res.status(400).json({ message: 'Website URL must start with http:// or https://' });
    }

    // Prepare update data - handle all possible undefined values
    const updateData = {};
    
    if (companyName !== undefined) updateData.companyName = companyName || '';
    if (website !== undefined) updateData.website = website || '';
    if (description !== undefined) updateData.description = description || '';
    if (stage !== undefined) {
      updateData.stage = stage || '';
      updateData.companyStage = stage || ''; // Also set this for consistency with existing data
    }
    if (industry !== undefined) updateData.industry = industry || '';

    console.log('Company update data to be saved:', updateData); // Debug log

    // Update the user record using DataService
    const updatedUser = await dataService.updateUser(req.user.id, updateData);

    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update company profile' });
    }

    console.log('Successfully updated company user:', updatedUser.id); // Debug log

    // Return the updated profile in the expected format
    const updatedProfile = {
      id: updatedUser.id,
      userId: updatedUser.id,
      companyName: updatedUser.companyName || '',
      website: updatedUser.website || '',
      description: updatedUser.description || '',
      stage: updatedUser.stage || updatedUser.companyStage || '',
      industry: updatedUser.industry || '',
      createdAt: updatedUser.createdAt || updatedUser.joinedDate,
      updatedAt: updatedUser.updatedAt
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// ==================== OPPORTUNITY MANAGEMENT ====================

/**
 * Get opportunities posted by the current company
 * 
 * Endpoint: GET /api/company/opportunities
 * Required Role: Company
 * 
 * @param {Object} req - Express request object (includes req.user from authMiddleware)
 * @param {Object} res - Express response object
 * 
 * Response: Array of opportunity objects posted by this company
 * Used by: Company opportunity management page, dashboard
 * 
 * Features:
 * - Filters opportunities by company ID (only shows company's own opportunities)
 * - Sorts by creation date (newest first)
 * - Includes all opportunity details and status information
 * - Provides basis for opportunity management (edit, delete, view applications)
 * 
 * Security:
 * - Verifies user has Company role
 * - Only returns opportunities owned by the authenticated company
 * - No access to other companies' opportunities
 */
exports.getOpportunities = async (req, res) => {
  try {
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'Company') {
      return res.status(403).json({ message: 'Access denied. Company role required.' });
    }

    // Get all opportunities and filter by company ID
    const opportunities = await dataService.getOpportunities();
    const companyOpportunities = opportunities.filter(opp => opp.companyId === user.id);
    
    // Sort by creation date (newest first)
    companyOpportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(companyOpportunities);
  } catch (error) {
    console.error('Error fetching company opportunities:', error);
    res.status(500).json({ message: 'Server error fetching company opportunities' });
  }
};
