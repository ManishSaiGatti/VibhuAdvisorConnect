const dataService = require('../services/dataService');

// Get LP profile
exports.getProfile = async (req, res) => {
  try {
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'LP') {
      return res.status(403).json({ message: 'Access denied. LP role required.' });
    }

    // Map user fields to profile structure expected by frontend
    const profile = {
      id: user.id,
      userId: user.id,
      headline: user.headline || '',
      bio: user.bio || '',
      linkedinUrl: user.linkedIn || user.linkedinUrl || '', // Handle both field names
      expertiseAreas: user.expertise || user.expertiseAreas || [],
      availableHours: user.availableHours || '',
      createdAt: user.createdAt || user.joinedDate,
      updatedAt: user.updatedAt || user.joinedDate
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching LP profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update LP profile
exports.updateProfile = async (req, res) => {
  try {
    const { headline, bio, linkedinUrl, expertiseAreas, availableHours } = req.body;
    
    console.log('Received profile update request:', req.body); // Debug log
    
    const user = await dataService.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'LP') {
      return res.status(403).json({ message: 'Access denied. LP role required.' });
    }

    // Validate expertise areas if provided
    if (expertiseAreas && !Array.isArray(expertiseAreas)) {
      return res.status(400).json({ message: 'Expertise areas must be an array' });
    }

    // Validate LinkedIn URL if provided
    if (linkedinUrl && linkedinUrl.trim() && !linkedinUrl.match(/^https?:\/\/(www\.)?linkedin\.com\//)) {
      return res.status(400).json({ message: 'Invalid LinkedIn URL format' });
    }

    // Prepare update data - handle all possible undefined values
    const updateData = {};
    
    if (headline !== undefined) updateData.headline = headline || '';
    if (bio !== undefined) updateData.bio = bio || '';
    if (linkedinUrl !== undefined) {
      updateData.linkedIn = linkedinUrl || ''; // Keep the existing field name
      updateData.linkedinUrl = linkedinUrl || ''; // Also set this for consistency
    }
    if (expertiseAreas !== undefined) {
      updateData.expertise = expertiseAreas || []; // Keep the existing field name
      updateData.expertiseAreas = expertiseAreas || []; // Also set this for consistency
    }
    if (availableHours !== undefined) updateData.availableHours = availableHours || '';

    console.log('Update data to be saved:', updateData); // Debug log

    // Update the user
    const updatedUser = await dataService.updateUser(req.user.id, updateData);

    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    console.log('Successfully updated user:', updatedUser.id); // Debug log

    // Return the updated profile in the expected format
    const updatedProfile = {
      id: updatedUser.id,
      userId: updatedUser.id,
      headline: updatedUser.headline || '',
      bio: updatedUser.bio || '',
      linkedinUrl: updatedUser.linkedIn || updatedUser.linkedinUrl || '',
      expertiseAreas: updatedUser.expertise || updatedUser.expertiseAreas || [],
      availableHours: updatedUser.availableHours || '',
      createdAt: updatedUser.createdAt || updatedUser.joinedDate,
      updatedAt: updatedUser.updatedAt
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating LP profile:', error);
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
};

// Get LP dashboard data (can be used to supplement the auth controller)
exports.getDashboardData = async (req, res) => {
  try {
    const user = await dataService.getUserById(req.user.id);
    const userConnections = await dataService.getConnectionsByLPId(req.user.id);
    const opportunities = await dataService.getOpportunities();
    
    if (!user || user.role !== 'LP') {
      return res.status(403).json({ message: 'Access denied. LP role required.' });
    }

    const dashboardData = {
      // LP profile
      expertiseAreas: user.expertise || user.expertiseAreas || ['General Business'],
      advisoryCommitments: userConnections.filter(c => c.status === 'active').length,
      availableHours: user.availableHours || 'Not specified',
      
      // Current advisory relationships
      activeAdvisoryRoles: userConnections
        .filter(conn => conn.status === 'active')
        .slice(0, 5)
        .map(conn => ({
          company: `Portfolio Company ${conn.id}`,
          stage: 'Seed',
          industry: 'Technology',
          monthsAdvising: Math.floor((new Date() - new Date(conn.startDate)) / (1000 * 60 * 60 * 24 * 30)),
          nextMeeting: conn.nextMeeting || 'TBD'
        })),
      
      // Opportunities
      newMatchingRequests: opportunities.filter(o => o.status === 'open').length,
      recommendedConnections: opportunities
        .filter(o => o.status === 'open')
        .slice(0, 3)
        .map(opp => ({
          company: opp.companyName,
          matchScore: Math.floor(Math.random() * 20) + 80,
          reason: `${opp.expertiseNeeded[0]} expertise needed`
        })),
      
      // Impact metrics
      companiesAdvised: userConnections.length,
      successfulExits: Math.floor(userConnections.length * 0.3),
      averageTimeToNextRound: '8.2 months',
      networkReferrals: Math.floor(userConnections.length * 1.5)
    };

    res.json({ 
      message: 'Welcome to LP Advisory Portal!', 
      user: req.user,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching LP dashboard:', error);
    res.status(500).json({ message: 'Server error loading dashboard' });
  }
};

// Get LP advisory opportunities (for browsing available opportunities)
exports.getOpportunities = async (req, res) => {
  try {
    const user = await dataService.getUserById(req.user.id);
    
    if (!user || user.role !== 'LP') {
      return res.status(403).json({ message: 'Access denied. LP role required.' });
    }

    const opportunities = await dataService.getOpportunities();
    
    // Filter to show open opportunities and add relevance scoring
    const openOpportunities = opportunities
      .filter(opp => opp.status === 'open')
      .map(opp => {
        // Calculate match score based on expertise overlap
        const userExpertise = user.expertise || user.expertiseAreas || [];
        const requiredExpertise = opp.expertiseNeeded || [];
        
        const matchCount = requiredExpertise.filter(skill => 
          userExpertise.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        ).length;
        
        const matchScore = requiredExpertise.length > 0 
          ? Math.round((matchCount / requiredExpertise.length) * 100)
          : 50;

        return {
          ...opp,
          matchScore,
          isRelevant: matchScore > 30
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by relevance

    res.json(openOpportunities);
  } catch (error) {
    console.error('Error fetching LP opportunities:', error);
    res.status(500).json({ message: 'Server error fetching opportunities' });
  }
};

// Express interest in an opportunity
exports.expressInterest = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { message } = req.body;
    
    const user = await dataService.getUserById(req.user.id);
    
    if (!user || user.role !== 'LP') {
      return res.status(403).json({ message: 'Access denied. LP role required.' });
    }

    const opportunity = await dataService.getOpportunityById(opportunityId);
    
    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.status !== 'open') {
      return res.status(400).json({ message: 'This opportunity is no longer open' });
    }

    // For now, we'll just increment the applications count
    // In a real system, you'd create an applications table/collection
    await dataService.updateOpportunity(opportunityId, {
      applications: opportunity.applications + 1
    });

    // You could also create a simple applications log
    const applicationsLog = {
      opportunityId: parseInt(opportunityId),
      lpId: req.user.id,
      lpName: `${user.firstName} ${user.lastName}`,
      message: message || '',
      appliedAt: new Date().toISOString(),
      status: 'pending'
    };

    res.json({ 
      message: 'Interest expressed successfully!',
      application: applicationsLog
    });
  } catch (error) {
    console.error('Error expressing interest:', error);
    res.status(500).json({ message: 'Server error expressing interest' });
  }
};
