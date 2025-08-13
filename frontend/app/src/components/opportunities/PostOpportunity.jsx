/**
 * @fileoverview Opportunity posting and editing component.
 * 
 * This component provides a comprehensive form interface for creating new
 * advisory opportunities or editing existing ones. It's exclusively available
 * to Company role users and includes form validation, data management,
 * and API integration for opportunity management.
 * 
 * Features:
 * - Create new advisory opportunities
 * - Edit existing opportunities with pre-populated data
 * - Multi-select expertise areas with predefined options
 * - Time commitment selection from standardized options
 * - Form validation and error handling
 * - Success feedback and navigation
 * - Responsive design for various screen sizes
 * 
 * Form Fields:
 * - Title: Brief, descriptive opportunity title
 * - Description: Detailed opportunity description and requirements
 * - Required Expertise: Multi-select from predefined expertise areas
 * - Time Commitment: Expected advisor time investment
 * - Compensation: Details about advisor compensation
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Callback to return to previous view
 * @param {Function} props.onSuccess - Callback called on successful operation
 * @param {Object|null} props.editingOpportunity - Opportunity data for editing (null for new)
 * 
 * @example
 * ```jsx
 * // Create new opportunity
 * <PostOpportunity 
 *   onBack={() => setView('dashboard')}
 *   onSuccess={() => setView('dashboard')}
 *   editingOpportunity={null}
 * />
 * 
 * // Edit existing opportunity
 * <PostOpportunity 
 *   onBack={() => setView('dashboard')}
 *   onSuccess={() => setView('dashboard')}
 *   editingOpportunity={opportunityData}
 * />
 * ```
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../utils';
import '../../styles/opportunities/PostOpportunity.css';

/**
 * Opportunity form component for creating and editing advisory opportunities.
 * 
 * This component provides a full-featured form interface for opportunity management.
 * It supports both create and edit modes, with intelligent form state management
 * and comprehensive validation.
 * 
 * Component Behavior:
 * - Create Mode: Clean form for new opportunity creation
 * - Edit Mode: Pre-populated form with existing opportunity data
 * - Validation: Required fields and format validation
 * - API Integration: Handles create/update operations
 * - User Feedback: Loading states, error messages, success notifications
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onBack - Navigation callback to return to dashboard
 * @param {Function} props.onSuccess - Success callback after create/update
 * @param {Object|null} props.editingOpportunity - Opportunity data for editing
 * @returns {JSX.Element} Rendered opportunity form component
 */
function PostOpportunity({ onBack, onSuccess, editingOpportunity }) {
  // Form state management
  const [opportunity, setOpportunity] = useState({
    title: '',
    description: '',
    requiredExpertise: [],
    timeCommitment: '',
    compensation: ''
  });
  
  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Configuration data for form options
  const [availableExpertise] = useState([
    'Fintech', 'Healthcare', 'AI/ML', 'Blockchain', 'SaaS', 'E-commerce', 
    'Cybersecurity', 'EdTech', 'PropTech', 'CleanTech', 'Biotech', 'Gaming',
    'Marketing', 'Sales', 'Operations', 'Strategy', 'Fundraising', 'Product Development',
    'International Expansion', 'M&A', 'IPO Preparation', 'Board Governance'
  ]);

  const [timeCommitmentOptions] = useState([
    '1-5 hours/month',
    '5-10 hours/month', 
    '10-15 hours/month',
    '15-20 hours/month',
    '20+ hours/month',
    'Project-based',
    'As needed'
  ]);

  /**
   * Form initialization effect for edit mode.
   * 
   * Populates form fields when editing an existing opportunity.
   * Determines whether component is in create or edit mode and
   * initializes form state accordingly.
   */
  // Effect to populate form when editing
  useEffect(() => {
    if (editingOpportunity) {
      setIsEditMode(true);
      setOpportunity({
        title: editingOpportunity.title || '',
        description: editingOpportunity.description || '',
        requiredExpertise: editingOpportunity.requiredExpertise || [],
        timeCommitment: editingOpportunity.timeCommitment || '',
        compensation: editingOpportunity.compensation || ''
      });
    } else {
      setIsEditMode(false);
      setOpportunity({
        title: '',
        description: '',
        requiredExpertise: [],
        timeCommitment: '',
        compensation: ''
      });
    }
  }, [editingOpportunity]);

  const handleInputChange = (field, value) => {
    setOpportunity(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const toggleExpertiseArea = (area) => {
    setOpportunity(prev => ({
      ...prev,
      requiredExpertise: prev.requiredExpertise.includes(area)
        ? prev.requiredExpertise.filter(e => e !== area)
        : [...prev.requiredExpertise, area]
    }));
    setError('');
    setSuccess('');
  };

  const addCustomExpertise = () => {
    if (expertiseInput.trim() && !opportunity.requiredExpertise.includes(expertiseInput.trim())) {
      setOpportunity(prev => ({
        ...prev,
        requiredExpertise: [...prev.requiredExpertise, expertiseInput.trim()]
      }));
      setExpertiseInput('');
    }
  };

  const removeExpertise = (expertiseToRemove) => {
    setOpportunity(prev => ({
      ...prev,
      requiredExpertise: prev.requiredExpertise.filter(e => e !== expertiseToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!opportunity.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!opportunity.description.trim()) {
      setError('Description is required');
      return;
    }
    if (opportunity.requiredExpertise.length === 0) {
      setError('At least one area of expertise is required');
      return;
    }
    if (!opportunity.timeCommitment) {
      setError('Time commitment is required');
      return;
    }
    if (!opportunity.compensation.trim()) {
      setError('Compensation details are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      let response;
      
      if (isEditMode && editingOpportunity) {
        // Update existing opportunity
        response = await axios.put(`http://localhost:3000/api/opportunities/${editingOpportunity.id}`, opportunity, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Opportunity updated successfully!');
      } else {
        // Create new opportunity
        response = await axios.post('http://localhost:3000/api/opportunities', opportunity, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Opportunity posted successfully!');
      }
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        onSuccess(response.data);
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'post'} opportunity. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const message = isEditMode 
      ? 'Are you sure you want to cancel? All unsaved changes will be lost.'
      : 'Are you sure you want to cancel? All unsaved changes will be lost.';
    
    if (window.confirm(message)) {
      onBack();
    }
  };

  return (
    <div className="post-opportunity-container">
      <div className="post-opportunity-header">
        <button className="back-button" onClick={handleCancel}>
          ← Back to Dashboard
        </button>
        <h1>{isEditMode ? 'Edit Advisory Opportunity' : 'Post New Advisory Opportunity'}</h1>
        <p>{isEditMode ? 'Update your opportunity details' : 'Attract qualified LP advisors from the vibhu.vc network'}</p>
      </div>

      <div className="post-opportunity-content">
        <div className="opportunity-form-section">
          {error && (
            <div className="alert error">
              <span className="alert-icon">⚠</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert success">
              <span className="alert-icon">✓</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="opportunity-form">
            <div className="form-group">
              <label htmlFor="title">Opportunity Title *</label>
              <input
                type="text"
                id="title"
                value={opportunity.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Senior Marketing Advisor for B2B SaaS Growth"
                className="form-input"
                required
              />
              <small className="form-help">Create a clear, compelling title that describes the advisory role</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Opportunity Description *</label>
              <textarea
                id="description"
                value={opportunity.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the advisory opportunity in detail. Include:
• What your company does and current stage
• Specific challenges you're facing
• What kind of guidance you're seeking
• Expected outcomes and impact
• Any relevant company metrics or context"
                className="form-textarea rich-text"
                rows="10"
                required
              />
              <small className="form-help">Provide detailed information about the opportunity, your company, and what you're looking for</small>
            </div>

            <div className="form-group">
              <label>Required Expertise *</label>
              <div className="expertise-section">
                <div className="selected-expertise">
                  {opportunity.requiredExpertise.map((expertise, index) => (
                    <span key={index} className="expertise-tag selected">
                      {expertise}
                      <button
                        type="button"
                        onClick={() => removeExpertise(expertise)}
                        className="remove-tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="expertise-selector">
                  <h4>Select from common areas:</h4>
                  <div className="expertise-options">
                    {availableExpertise.map((area) => (
                      <button
                        key={area}
                        type="button"
                        className={`expertise-option ${opportunity.requiredExpertise.includes(area) ? 'selected' : ''}`}
                        onClick={() => toggleExpertiseArea(area)}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="custom-expertise">
                  <h4>Or add custom expertise:</h4>
                  <div className="custom-input-group">
                    <input
                      type="text"
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      placeholder="Enter custom expertise area"
                      className="form-input"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomExpertise();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomExpertise}
                      className="add-button"
                      disabled={!expertiseInput.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <small className="form-help">Select or add the specific areas of expertise you need for this advisory role</small>
            </div>

            <div className="form-group">
              <label htmlFor="timeCommitment">Time Commitment *</label>
              <select
                id="timeCommitment"
                value={opportunity.timeCommitment}
                onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                className="form-input"
                required
              >
                <option value="">Select expected time commitment</option>
                {timeCommitmentOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <small className="form-help">Expected time commitment from the advisor</small>
            </div>

            <div className="form-group">
              <label htmlFor="compensation">Compensation Details *</label>
              <textarea
                id="compensation"
                value={opportunity.compensation}
                onChange={(e) => handleInputChange('compensation', e.target.value)}
                placeholder="e.g., 0.25% equity, $2,000/month cash, or combination of equity and cash compensation..."
                className="form-textarea"
                rows="4"
                required
              />
              <small className="form-help">Describe the compensation structure (equity, cash, or combination)</small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading 
                  ? (isEditMode ? 'Updating Opportunity...' : 'Posting Opportunity...') 
                  : (isEditMode ? 'Update Opportunity' : 'Post Opportunity')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostOpportunity;
