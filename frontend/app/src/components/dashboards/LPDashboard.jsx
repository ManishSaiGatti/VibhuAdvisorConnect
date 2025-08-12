import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils';
import { LPOpportunitiesPage } from '../opportunities';
import '../../styles/dashboards/LPDashboard.css';

function LPDashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState({
    headline: '',
    bio: '',
    linkedinUrl: '',
    expertiseAreas: [],
    availableHours: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [availableExpertiseAreas] = useState([
    'Fintech', 'Healthcare', 'AI/ML', 'Blockchain', 'SaaS', 'E-commerce', 
    'Cybersecurity', 'EdTech', 'PropTech', 'CleanTech', 'Biotech', 'Gaming',
    'Marketing', 'Sales', 'Operations', 'Strategy', 'Fundraising', 'Product Development',
    'International Expansion', 'M&A', 'IPO Preparation', 'Board Governance'
  ]);
  const [sectionsVisible, setSectionsVisible] = useState({
    welcome: false,
    portfolio: false,
    expertise: false,
    advisories: false,
    recommendations: false,
    actions: false
  });

  useEffect(() => {
    const fetchLPData = async () => {
      try {
        const token = getToken();
        const response = await axios.get('http://localhost:3000/api/auth/dashboard/lp', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setLoading(false);
        
        // Start staggered animation after data loads
        startStaggeredAnimation();
      } catch (err) {
        setError('Failed to load LP dashboard');
        setLoading(false);
      }
    };

    fetchLPData();
  }, []);

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3000/api/lp/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (err) {
      setProfileError('Failed to load profile');
    }
  };

  const startStaggeredAnimation = () => {
    const delays = [200, 400, 600, 800, 1000, 1200]; // milliseconds
    const sections = ['welcome', 'portfolio', 'expertise', 'advisories', 'recommendations', 'actions'];
    
    sections.forEach((section, index) => {
      setTimeout(() => {
        setSectionsVisible(prev => ({
          ...prev,
          [section]: true
        }));
      }, delays[index]);
    });
  };

  // Handle profile form changes
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    setProfileError('');
    setProfileSuccess('');
  };

  // Handle expertise area toggle
  const toggleExpertiseArea = (area) => {
    setProfile(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(area)
        ? prev.expertiseAreas.filter(e => e !== area)
        : [...prev.expertiseAreas, area]
    }));
    setProfileError('');
    setProfileSuccess('');
  };

  // Handle profile save
  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const token = getToken();
      await axios.put('http://localhost:3000/api/lp/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError('Failed to update profile. Please try again.');
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

      const resetValue = field === 'expertiseAreas' ? [] : '';
      const updatedProfile = {
        ...profile,
        [field]: resetValue
      };

      try {
        const token = getToken();
        await axios.put('http://localhost:3000/api/lp/profile', updatedProfile, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state after successful save
        setProfile(updatedProfile);
        setProfileSuccess(`${field === 'expertiseAreas' ? 'Expertise areas' : field.charAt(0).toUpperCase() + field.slice(1)} cleared successfully!`);
      } catch (err) {
        setProfileError('Failed to clear field. Please try again.');
      } finally {
        setProfileLoading(false);
      }
    }
  };

  // Handle master reset (save all empty values to backend)
  const handleMasterReset = async () => {
    if (window.confirm('Are you sure you want to clear ALL profile fields? This will permanently remove all saved profile data.')) {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const emptyProfile = {
        headline: '',
        bio: '',
        linkedinUrl: '',
        expertiseAreas: [],
        availableHours: ''
      };

      try {
        const token = getToken();
        await axios.put('http://localhost:3000/api/lp/profile', emptyProfile, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state after successful save
        setProfile(emptyProfile);
        setProfileSuccess('All profile fields cleared successfully!');
      } catch (err) {
        setProfileError('Failed to clear profile. Please try again.');
      } finally {
        setProfileLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="lp-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lp-container">
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
    <div className="lp-container">
      <header className="lp-header">
        <div className="lp-header-content">
          <h1>LP Advisor Portal</h1>
          <p>Connect with portfolio companies and share your expertise</p>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="lp-nav">
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
          My Profile
        </button>
      </nav>

      <main className="lp-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading LP dashboard...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <div className="error-alert">
                  <span className="error-icon">⚠</span>
                  {error}
                </div>
                <button className="logout-button" onClick={onLogout}>
                  Back to Landing
                </button>
              </div>
            ) : (
              <>
                <section className={`lp-section welcome-section ${sectionsVisible.welcome ? 'visible' : ''}`}>
                  <div className="lp-content">
                    <h2>Welcome back, {data?.user?.firstName}!</h2>
                    <p>Your advisory network impact dashboard</p>
                  </div>
                </section>

                <section className={`lp-section portfolio-section ${sectionsVisible.portfolio ? 'visible' : ''}`}>
                  <h3>Advisory Portfolio</h3>
                  <div className="portfolio-grid">
                    <div className="portfolio-card highlight">
                      <h3>Advisory Commitments</h3>
                      <p className="portfolio-number">{data?.data?.advisoryCommitments}</p>
                      <p className="portfolio-label">Active Startup Advisories</p>
                    </div>
                    <div className="portfolio-card">
                      <h3>Available Hours</h3>
                      <p className="portfolio-number">{data?.data?.availableHours}</p>
                      <p className="portfolio-label">Monthly Advisory Capacity</p>
                    </div>
                    <div className="portfolio-card">
                      <h3>Companies Advised</h3>
                      <p className="portfolio-number positive">{data?.data?.companiesAdvised}</p>
                      <p className="portfolio-label">Total Portfolio Impact</p>
                    </div>
                    <div className="portfolio-card">
                      <h3>New Matches</h3>
                      <p className="portfolio-number">{data?.data?.newMatchingRequests}</p>
                      <p className="portfolio-label">Pending Opportunities</p>
                    </div>
                  </div>
                </section>

                <section className={`expertise-section fade-in ${sectionsVisible.expertise ? 'visible' : ''}`}>
                  <h3>Your Expertise Areas</h3>
                  <div className="expertise-tags">
                    {data?.data?.expertiseAreas?.map((area, index) => (
                      <span key={index} className="expertise-tag">{area}</span>
                    ))}
                  </div>
                </section>

                <section className={`current-advisories fade-in ${sectionsVisible.advisories ? 'visible' : ''}`}>
                  <h3>Current Advisory Roles</h3>
                  <div className="advisory-list">
                    {data?.data?.activeAdvisoryRoles?.map((role, index) => (
                      <div key={index} className="advisory-card">
                        <div className="advisory-header">
                          <h4>{role.company}</h4>
                          <span className="stage-badge">{role.stage}</span>
                        </div>
                        <p className="advisory-industry">{role.industry}</p>
                        <div className="advisory-details">
                          <span>Advising for {role.monthsAdvising} months</span>
                          <span>Next meeting: {role.nextMeeting}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={`recommendations fade-in ${sectionsVisible.recommendations ? 'visible' : ''}`}>
                  <h3>Recommended Connections</h3>
                  <div className="recommendation-list">
                    {data?.data?.recommendedConnections?.map((rec, index) => (
                      <div key={index} className="recommendation-card">
                        <div className="rec-header">
                          <h4>{rec.company}</h4>
                          <span className="match-score">{rec.matchScore}% match</span>
                        </div>
                        <p className="rec-reason">{rec.reason}</p>
                        <button className="connect-button">Connect</button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={`lp-actions fade-in ${sectionsVisible.actions ? 'visible' : ''}`}>
                  <h3>Advisory Platform</h3>
                  <div className="action-buttons">
                    <button className="action-button primary">View All Startups</button>
                    <button className="action-button secondary">Schedule Advisory Session</button>
                    <button className="action-button tertiary">Update Availability</button>
                    <button className="action-button success">Refer Network Connections</button>
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-content">
            <div className="profile-section">
              <h2>My Professional Profile</h2>
              <p>Manage your profile information to better connect with portfolio companies</p>
              
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
                    <label htmlFor="headline">Professional Headline</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('headline')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    type="text"
                    id="headline"
                    value={profile.headline}
                    onChange={(e) => handleProfileChange('headline', e.target.value)}
                    placeholder="e.g., Former McKinsey Partner | FinTech Advisor | Board Member"
                    className="form-input"
                  />
                  <small className="form-help">Brief description of your professional background</small>
                </div>

                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label htmlFor="bio">Professional Bio</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('bio')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Share your professional background, key achievements, and what value you bring to startups..."
                    className="form-textarea"
                    rows="6"
                  />
                  <small className="form-help">Detailed overview of your experience and expertise</small>
                </div>

                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label htmlFor="availableHours">Available Hours (Monthly)</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('availableHours')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    type="text"
                    id="availableHours"
                    value={profile.availableHours}
                    onChange={(e) => handleProfileChange('availableHours', e.target.value)}
                    placeholder="e.g., 10-15 hours per month"
                    className="form-input"
                  />
                  <small className="form-help">How many hours per month you can dedicate to advisory activities</small>
                </div>

                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('linkedinUrl')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <input
                    type="url"
                    id="linkedinUrl"
                    value={profile.linkedinUrl}
                    onChange={(e) => handleProfileChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="form-input"
                  />
                  <small className="form-help">Your LinkedIn profile for professional verification</small>
                </div>

                <div className="form-group">
                  <div className="form-label-with-reset">
                    <label>Areas of Expertise</label>
                    <button
                      type="button"
                      onClick={() => handleFieldReset('expertiseAreas')}
                      className="reset-field-button"
                      disabled={profileLoading}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="expertise-selector">
                    {availableExpertiseAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        className={`expertise-option ${profile.expertiseAreas.includes(area) ? 'selected' : ''}`}
                        onClick={() => toggleExpertiseArea(area)}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                  <small className="form-help">Select areas where you can provide advisory support</small>
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
                    {profileLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="opportunities-content">
            <LPOpportunitiesPage />
          </div>
        )}
      </main>
    </div>
  );
}

export default LPDashboard;
