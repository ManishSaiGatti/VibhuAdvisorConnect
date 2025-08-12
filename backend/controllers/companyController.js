const dataService = require('../services/dataService');

// Get Company profile
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

// Update Company profile
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

    // Update the user
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

// Get opportunities posted by the current company
exports.getOpportunities = async (req, res) => {
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
    
    // Sort by creation date (newest first)
    companyOpportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(companyOpportunities);
  } catch (error) {
    console.error('Error fetching company opportunities:', error);
    res.status(500).json({ message: 'Server error fetching company opportunities' });
  }
};
