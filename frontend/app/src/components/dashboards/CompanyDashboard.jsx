import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils';
import { OpportunitiesPage } from '../opportunities';
import '../../styles/dashboards/CompanyDashboard.css';

function CompanyDashboard({ onLogout, onPostOpportunity, onEditOpportunity }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyProfile, setCompanyProfile] = useState({
    companyName: '',
    website: '',
    description: '',
    stage: '',
    industry: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [availableStages] = useState([
    'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Growth', 'Pre-IPO'
  ]);
  const [availableIndustries] = useState([
    'Fintech', 'Healthcare', 'AI/ML', 'Blockchain', 'SaaS', 'E-commerce', 
    'Cybersecurity', 'EdTech', 'PropTech', 'CleanTech', 'Biotech', 'Gaming',
    'Consumer', 'Enterprise', 'Marketplace', 'Hardware', 'DeepTech', 'Mobility'
  ]);
  const [sectionsVisible, setSectionsVisible] = useState({
    welcome: false,
    funding: false,
    advisors: false,
    needs: false,
    milestones: false,
    impact: false,
    actions: false
  });

  const fetchCompanyProfile = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3000/api/company/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanyProfile(response.data);
    } catch (err) {
      setProfileError('Failed to load company profile');
    }
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = getToken();
        const response = await axios.get('http://localhost:3000/api/auth/dashboard/company', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setLoading(false);
        
        // Start staggered animation after data loads
        startStaggeredAnimation();
      } catch (err) {
        setError('Failed to load company dashboard');
        setLoading(false);
      }
    };

    // Only fetch dashboard data on component mount
    fetchCompanyData();
    // Remove the automatic profile fetch to prevent refreshing
    // fetchCompanyProfile();
  }, []);

  useEffect(() => {
    // Only fetch profile data when switching to profile tab
    if (activeTab === 'profile') {
      fetchCompanyProfile();
    }
    // Fetch profile data once when dashboard tab is first loaded (for dashboard display)
    if (activeTab === 'dashboard' && !companyProfile.companyName && !companyProfile.stage && !companyProfile.industry && !companyProfile.website) {
      fetchCompanyProfile();
    }
  }, [activeTab]);

  const startStaggeredAnimation = () => {
    const delays = [200, 400, 600, 800, 1000, 1200, 1400]; // milliseconds
    const sections = ['welcome', 'funding', 'advisors', 'needs', 'milestones', 'impact', 'actions'];
    
    sections.forEach((section, index) => {
      setTimeout(() => {
        setSectionsVisible(prev => ({
          ...prev,
          [section]: true
        }));
      }, delays[index]);
    });
  };

  // Handle company profile form changes
  const handleProfileChange = (field, value) => {
    setCompanyProfile(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    setProfileError('');
    setProfileSuccess('');
  };

  // Handle company profile save
  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const token = getToken();
      await axios.put('http://localhost:3000/api/company/profile', companyProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileSuccess('Company profile updated successfully!');
    } catch (err) {
      setProfileError('Failed to update company profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle individual field reset (save empty value to backend)
  const handleFieldReset = async (field) => {
    if (window.confirm(`Are you sure you want to clear this field? This will permanently remove the saved data.`)) {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const updatedProfile = {
        ...companyProfile,
        [field]: ''
      };

      try {
        const token = getToken();
        await axios.put('http://localhost:3000/api/company/profile', updatedProfile, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state after successful save
        setCompanyProfile(updatedProfile);
        setProfileSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} cleared successfully!`);
      } catch (err) {
        setProfileError('Failed to clear field. Please try again.');
      } finally {
        setProfileLoading(false);
      }
    }
  };

  // Handle master reset (save all empty values to backend)
  const handleMasterReset = async () => {
    if (window.confirm('Are you sure you want to clear ALL company profile fields? This will permanently remove all saved profile data.')) {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const emptyProfile = {
        companyName: '',
        website: '',
        description: '',
        stage: '',
        industry: ''
      };

      try {
        const token = getToken();
        await axios.put('http://localhost:3000/api/company/profile', emptyProfile, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state after successful save
        setCompanyProfile(emptyProfile);
        setProfileSuccess('All company profile fields cleared successfully!');
      } catch (err) {
        setProfileError('Failed to clear company profile. Please try again.');
      } finally {
        setProfileLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="company-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your startup dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="company-container">
        <div className="error-container">
          <div className="error-alert">
            <span className="error-icon">⚠</span>
            {error}
          </div>
          <button className="logout-button" onClick={onLogout}>
            Back to Landing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="company-container">
      <div className="company-header">
        <h1 className="dashboard-title">Startup Dashboard</h1>
        <div className="header-info">
          <span className="user-name">Welcome, {data?.user?.name}</span>
          <button className="logout-button-header" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <nav className="company-nav">
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          Opportunities
        </button>
        <button 
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Company
        </button>
      </nav>
      
      <div className="company-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className={`welcome-card fade-in ${sectionsVisible.welcome ? 'visible' : ''}`}>
              <h2 className="welcome-title">🚀 Startup Growth Hub</h2>
              <p className="welcome-message">{data?.message}</p>
            </div>

        <div className={`funding-grid fade-in ${sectionsVisible.funding ? 'visible' : ''}`}>
          <div className="funding-card highlight">
            <h3>Company Stage</h3>
            <p className="funding-number">{companyProfile?.stage || data?.data?.stage || 'Not set'}</p>
            <p className="funding-label">Current Funding Stage</p>
          </div>

          <div className="funding-card">
            <h3>Industry</h3>
            <p className="funding-number">{companyProfile?.industry || data?.data?.industry || 'Not set'}</p>
            <p className="funding-label">Sector Focus</p>
          </div>

          <div className="funding-card">
            <h3>Company Name</h3>
            <p className="funding-number">{companyProfile?.companyName || data?.data?.companyName || 'Not set'}</p>
            <p className="funding-label">Registered Name</p>
          </div>

          <div className="funding-card">
            <h3>Website</h3>
            <p className="funding-number">
              {companyProfile?.website || data?.data?.website ? (
                <a 
                  href={companyProfile?.website || data?.data?.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Visit Site →
                </a>
              ) : (
                'Not set'
              )}
            </p>
            <p className="funding-label">Company Website</p>
          </div>
        </div>

        <div className={`advisors-section fade-in ${sectionsVisible.advisors ? 'visible' : ''}`}>
          <h3>Your Advisory Team</h3>
          <div className="advisors-list">
            {data?.data?.connectedAdvisors?.map((advisor, index) => (
              <div key={index} className="advisor-card">
                <div className="advisor-header">
                  <h4>{advisor.name}</h4>
                  <span className="status-badge active">{advisor.status}</span>
                </div>
                <p className="advisor-expertise">{advisor.expertise}</p>
                <div className="advisor-details">
                  <span>Meets {advisor.meetingFrequency}</span>
                  <span>Last: {advisor.lastMeeting}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`needs-section fade-in ${sectionsVisible.needs ? 'visible' : ''}`}>
          <h3>Advisory Needs</h3>
          <div className="needs-content">
            <div className="requested-expertise">
              <h4>Requested Expertise</h4>
              <div className="expertise-tags">
                {data?.data?.requestedExpertise?.map((area, index) => (
                  <span key={index} className="expertise-tag">{area}</span>
                ))}
              </div>
            </div>
            <div className="pending-matches">
              <h4>Pending Matches</h4>
              <p className="match-count">{data?.data?.pendingMatches} potential advisors</p>
            </div>
          </div>
        </div>

        <div className={`milestones-section fade-in ${sectionsVisible.milestones ? 'visible' : ''}`}>
          <h3>Key Milestones</h3>
          <div className="milestones-list">
            {data?.data?.keyMilestones?.map((milestone, index) => (
              <div key={index} className={`milestone-item ${milestone.status.toLowerCase().replace(' ', '-')}`}>
                <div className="milestone-info">
                  <h4>{milestone.milestone}</h4>
                  <span className="milestone-status">{milestone.status}</span>
                </div>
                <span className="milestone-date">
                  {milestone.date || milestone.target}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`impact-metrics fade-in ${sectionsVisible.impact ? 'visible' : ''}`}>
          <h3>Advisory Impact</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-value">{data?.data?.advisoryMeetingsThisMonth}</span>
              <span className="metric-label">Meetings This Month</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{data?.data?.actionItemsCompleted}</span>
              <span className="metric-label">Action Items Completed</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{data?.data?.networkIntroductions}</span>
              <span className="metric-label">Network Introductions</span>
            </div>
          </div>
        </div>

            <div className={`company-actions fade-in ${sectionsVisible.actions ? 'visible' : ''}`}>
              <h3>Growth Resources</h3>
              <div className="action-buttons">
                <button className="action-button primary">Request New Advisor</button>
                <button className="action-button secondary">Schedule Advisory Meeting</button>
                <button className="action-button tertiary">Update Company Profile</button>
                <button className="action-button success">Prepare for {data?.data?.nextFundraisingTarget}</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesPage 
            onPostOpportunity={onPostOpportunity} 
            onEditOpportunity={onEditOpportunity}
          />
        )}

        {activeTab === 'profile' && (
          <div className="profile-content">
            <div className="profile-section">
              <h2>Company Profile</h2>
              <p>Manage your company information to better connect with LP advisors</p>
              
              {profileError && (
                <div className="profile-alert error">
                  <span className="alert-icon">⚠</span>
                  {profileError}
                </div>
              )}
              
              {profileSuccess && (
                <div className="profile-alert success">
                  <span className="alert-icon">✓</span>
                  {profileSuccess}
                </div>
              )}

              <div className="profile-form">
                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label htmlFor="companyName">Company Name</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('companyName')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    type="text"
                    id="companyName"
                    value={companyProfile.companyName}
                    onChange={(e) => handleProfileChange('companyName', e.target.value)}
                    placeholder="e.g., TechStartup Inc."
                    className="form-input"
                  />
                  <small className="form-help">Official registered name of your company</small>
                </div>

                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label htmlFor="website">Website</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('website')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    type="url"
                    id="website"
                    value={companyProfile.website}
                    onChange={(e) => handleProfileChange('website', e.target.value)}
                    placeholder="https://www.yourcompany.com"
                    className="form-input"
                  />
                  <small className="form-help">Your company's main website URL</small>
                </div>

                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label htmlFor="description">Company Description</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('description')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    id="description"
                    value={companyProfile.description}
                    onChange={(e) => handleProfileChange('description', e.target.value)}
                    placeholder="Describe what your company does, your mission, key products/services, and what makes you unique..."
                    className="form-textarea"
                    rows="6"
                  />
                  <small className="form-help">Detailed overview of your business and value proposition</small>
                </div>

                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label htmlFor="stage">Funding Stage</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('stage')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <select
                    id="stage"
                    value={companyProfile.stage}
                    onChange={(e) => handleProfileChange('stage', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select funding stage</option>
                    {availableStages.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                  <small className="form-help">Current funding or development stage of your company</small>
                </div>

                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label htmlFor="industry">Industry</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('industry')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <select
                    id="industry"
                    value={companyProfile.industry}
                    onChange={(e) => handleProfileChange('industry', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select industry</option>
                    {availableIndustries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  <small className="form-help">Primary industry or sector your company operates in</small>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleMasterReset}
                    disabled={profileLoading}
                    className="clear-all-button"
                  >
                    {profileLoading ? 'Clearing...' : 'Clear All'}
                  </button>
                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={profileLoading}
                    className="save-button"
                  >
                    {profileLoading ? 'Saving...' : 'Save Company Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyDashboard;
