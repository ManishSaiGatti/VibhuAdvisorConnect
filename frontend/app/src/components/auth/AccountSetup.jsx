/**
 * @fileoverview Account Setup component for first-time Google OAuth users.
 * 
 * This component handles the initial account setup flow for users who sign in
 * with Google for the first time. It allows them to choose their account type
 * (LP or Company) and set up their profile information.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.googleUser - Google user data from OAuth
 * @param {Function} props.onSetupComplete - Callback when setup is completed
 * @param {Function} props.onBack - Callback to go back to login
 */

import { useState } from 'react';
import axios from 'axios';
import { setAuthData } from '../../utils';
import '../../styles/components/AccountSetup.css';

function AccountSetup({ googleUser, onSetupComplete, onBack }) {
  const [accountType, setAccountType] = useState('');
  const [profileData, setProfileData] = useState({
    // Common fields
    firstName: googleUser?.given_name || '',
    lastName: googleUser?.family_name || '',
    
    // LP-specific fields
    headline: '',
    bio: '',
    linkedinUrl: '',
    expertiseAreas: [],
    availableHours: '',
    
    // Company-specific fields
    companyName: '',
    website: '',
    description: '',
    stage: '',
    industry: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Available options for dropdowns
  const [availableStages] = useState([
    'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Growth', 'Pre-IPO'
  ]);
  const [availableIndustries] = useState([
    'Fintech', 'Healthcare', 'AI/ML', 'Blockchain', 'SaaS', 'E-commerce', 
    'Cybersecurity', 'EdTech', 'PropTech', 'CleanTech', 'Biotech', 'Gaming',
    'Consumer', 'Enterprise', 'Marketplace', 'Hardware', 'DeepTech', 'Mobility'
  ]);
  const [availableExpertiseAreas] = useState([
    'Fintech', 'Healthcare', 'AI/ML', 'Blockchain', 'SaaS', 'E-commerce', 
    'Cybersecurity', 'EdTech', 'PropTech', 'CleanTech', 'Biotech', 'Gaming',
    'Marketing', 'Sales', 'Operations', 'Strategy', 'Fundraising', 'Product Development',
    'International Expansion', 'M&A', 'IPO Preparation', 'Board Governance'
  ]);

  /**
   * Handle expertise area toggle (for LP users)
   */
  const toggleExpertiseArea = (area) => {
    setProfileData(prev => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(area)
        ? prev.expertiseAreas.filter(e => e !== area)
        : [...prev.expertiseAreas, area]
    }));
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Submit the account setup form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountType) {
      setError('Please select an account type');
      return;
    }

    // Validate required fields based on account type
    if (accountType === 'LP') {
      if (!profileData.headline || !profileData.bio || !profileData.availableHours) {
        setError('Please fill in all required LP fields');
        return;
      }
      if (profileData.expertiseAreas.length === 0) {
        setError('Please select at least one area of expertise');
        return;
      }
    }

    if (accountType === 'Company') {
      if (!profileData.companyName || !profileData.description || !profileData.stage || !profileData.industry) {
        setError('Please fill in all required company fields');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Send setup data to backend
      const setupData = {
        googleUser,
        accountType,
        profileData
      };

      const response = await axios.post('http://localhost:3000/api/auth/google/setup', setupData);
      
      // Store authentication data
      setAuthData(response.data.token, response.data.user);
      
      // Notify parent component
      onSetupComplete(response.data.user);
    } catch (err) {
      setError('Setup failed. Please try again.');
      console.error('Account setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-setup-container">
      <div className="account-setup-card">
        <div className="setup-header">
          <h1>Complete Your Account Setup</h1>
          <p>Welcome to Vibhu Advisor Connect! Let's set up your profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          {/* Account Type Selection */}
          <div className="form-section">
            <h3>Choose Your Account Type</h3>
            <div className="account-type-options">
              <label className={`account-type-option ${accountType === 'LP' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="LP"
                  checked={accountType === 'LP'}
                  onChange={(e) => setAccountType(e.target.value)}
                />
                <div className="option-content">
                  <h4>Limited Partner (LP)</h4>
                  <p>Provide advisory services to portfolio companies</p>
                </div>
              </label>

              <label className={`account-type-option ${accountType === 'Company' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="Company"
                  checked={accountType === 'Company'}
                  onChange={(e) => setAccountType(e.target.value)}
                />
                <div className="option-content">
                  <h4>Company</h4>
                  <p>Seek advisory services for your startup</p>
                </div>
              </label>
            </div>
          </div>

          {/* Profile Information */}
          <div className="form-section">
            <h3>Profile Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* LP-specific fields */}
            {accountType === 'LP' && (
              <>
                <div className="form-group">
                  <label>Professional Headline</label>
                  <input
                    type="text"
                    value={profileData.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    placeholder="e.g., Former McKinsey Partner | FinTech Advisor | Board Member"
                    required
                  />
                  <small>Brief description of your professional background</small>
                </div>

                <div className="form-group">
                  <label>Professional Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Share your professional background, key achievements, and what value you bring to startups..."
                    rows="4"
                    required
                  />
                  <small>Detailed overview of your experience and expertise</small>
                </div>

                <div className="form-group">
                  <label>Available Hours (Monthly)</label>
                  <input
                    type="text"
                    value={profileData.availableHours}
                    onChange={(e) => handleInputChange('availableHours', e.target.value)}
                    placeholder="e.g., 10-15 hours per month"
                    required
                  />
                  <small>How many hours per month you can dedicate to advisory activities</small>
                </div>

                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input
                    type="url"
                    value={profileData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  <small>Your LinkedIn profile for professional verification</small>
                </div>

                <div className="form-group">
                  <label>Areas of Expertise</label>
                  <div className="expertise-selector">
                    {availableExpertiseAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        className={`expertise-option ${profileData.expertiseAreas.includes(area) ? 'selected' : ''}`}
                        onClick={() => toggleExpertiseArea(area)}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                  <small>Select areas where you can provide advisory support (select at least one)</small>
                </div>
              </>
            )}

            {/* Company-specific fields */}
            {accountType === 'Company' && (
              <>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={profileData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g., TechStartup Inc."
                    required
                  />
                  <small>Official registered name of your company</small>
                </div>

                <div className="form-group">
                  <label>Company Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.yourcompany.com"
                  />
                  <small>Your company's main website URL</small>
                </div>

                <div className="form-group">
                  <label>Company Description</label>
                  <textarea
                    value={profileData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what your company does, your mission, key products/services, and what makes you unique..."
                    rows="4"
                    required
                  />
                  <small>Detailed overview of your business and value proposition</small>
                </div>

                <div className="form-group">
                  <label>Funding Stage</label>
                  <select
                    value={profileData.stage}
                    onChange={(e) => handleInputChange('stage', e.target.value)}
                    required
                  >
                    <option value="">Select funding stage</option>
                    {availableStages.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                  <small>Current funding or development stage of your company</small>
                </div>

                <div className="form-group">
                  <label>Industry</label>
                  <select
                    value={profileData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    required
                  >
                    <option value="">Select industry</option>
                    {availableIndustries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  <small>Primary industry or sector your company operates in</small>
                </div>
              </>
            )}

            {/* Show message when no account type is selected */}
            {!accountType && (
              <div className="account-type-message">
                <p>Please select an account type above to continue with your profile setup.</p>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onBack} 
              className="btn-secondary"
              disabled={loading}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountSetup;
