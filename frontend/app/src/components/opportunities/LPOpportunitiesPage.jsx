import { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../utils';
import '../../styles/opportunities/OpportunitiesPage.css';

function LPOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [filters, setFilters] = useState({
    expertise: '',
    timeCommitment: '',
    search: ''
  });

  const [expertiseOptions] = useState([
    'All', 'Fintech', 'Healthcare', 'AI/ML', 'Blockchain', 'SaaS', 'E-commerce', 
    'Cybersecurity', 'EdTech', 'PropTech', 'CleanTech', 'Biotech', 'Gaming',
    'Marketing', 'Sales', 'Operations', 'Strategy', 'Fundraising', 'Product Development',
    'International Expansion', 'M&A', 'IPO Preparation', 'Board Governance'
  ]);

  const [timeCommitmentOptions] = useState([
    'All', '1-5 hours/month', '5-10 hours/month', '10-15 hours/month',
    '15-20 hours/month', '20+ hours/month', 'Project-based', 'As needed'
  ]);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3000/api/opportunities', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: 'open',
          ...filters
        }
      });
      setOpportunities(response.data);
    } catch (err) {
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value === 'All' ? '' : value
    }));
  };

  const applyFilters = () => {
    fetchOpportunities();
  };

  const clearFilters = () => {
    setFilters({
      expertise: '',
      timeCommitment: '',
      search: ''
    });
    setTimeout(fetchOpportunities, 100);
  };

  const handleViewDetails = async (opportunity) => {
    setSelectedOpportunity(opportunity);
    
    // Track view count using dedicated endpoint
    try {
      const token = getToken();
      console.log('Attempting to track view for opportunity:', opportunity.id);
      
      const response = await axios.post(`http://localhost:3000/api/opportunities/${opportunity.id}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('View tracking response:', response.data);
      
      // Update the view count in local state with the response data
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunity.id 
          ? { ...opp, viewCount: response.data.viewCount }
          : opp
      ));
      
      console.log('Updated view count locally to:', response.data.viewCount);
    } catch (err) {
      // Don't show error to user for view tracking, just log it
      console.error('Failed to track view:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  const handleCloseDetails = () => {
    setSelectedOpportunity(null);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && selectedOpportunity) {
        handleCloseDetails();
      }
    };

    if (selectedOpportunity) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [selectedOpportunity]);

  const handleApply = async (opportunityId) => {
    try {
      const token = getToken();
      await axios.post(`http://localhost:3000/api/opportunities/${opportunityId}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh opportunities to update application status
      fetchOpportunities();
      
      // Close details modal if open
      if (selectedOpportunity?.id === opportunityId) {
        setSelectedOpportunity(null);
      }
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'closed': return 'status-closed';
      case 'filled': return 'status-filled';
      default: return 'status-open';
    }
  };

  if (loading) {
    return (
      <div className="opportunities-loading">
        <div className="spinner"></div>
        <p>Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="opportunities-page">
      <div className="opportunities-header">
        <h2>Advisory Opportunities</h2>
        <p>Discover advisory opportunities that match your expertise</p>
      </div>

      {error && (
        <div className="alert error">
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="filters-section">
        <h3>Filter Opportunities</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search titles and descriptions..."
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Expertise Area</label>
            <select
              value={filters.expertise || 'All'}
              onChange={(e) => handleFilterChange('expertise', e.target.value)}
              className="filter-select"
            >
              {expertiseOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Time Commitment</label>
            <select
              value={filters.timeCommitment || 'All'}
              onChange={(e) => handleFilterChange('timeCommitment', e.target.value)}
              className="filter-select"
            >
              {timeCommitmentOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={applyFilters} className="apply-filters-btn">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="opportunities-list">
        <div className="list-header">
          <h3>Available Opportunities ({opportunities.length})</h3>
        </div>
        
        {opportunities.length === 0 ? (
          <div className="no-opportunities">
            <p>No opportunities found matching your criteria.</p>
          </div>
        ) : (
          <div className="opportunities-grid">
            {opportunities.map((opp) => (
              <div key={opp.id} className="opportunity-card lp-browse-card">
                <div className="opportunity-header">
                  <h4>{opp.title}</h4>
                  <span className={`status-badge ${getStatusBadgeClass(opp.status)}`}>
                    {opp.status}
                  </span>
                </div>
                
                <div className="opportunity-meta">
                  <span className="company-name">{opp.companyName || 'Company'}</span>
                  <span className="post-date">Posted {formatDate(opp.createdAt)}</span>
                </div>

                <p className="opportunity-description">
                  {opp.description.length > 150 
                    ? `${opp.description.substring(0, 150)}...` 
                    : opp.description}
                </p>

                <div className="opportunity-details">
                  <div className="detail-item">
                    <strong>Time Commitment:</strong> {opp.timeCommitment}
                  </div>
                  <div className="detail-item">
                    <strong>Expertise:</strong>
                    <div className="expertise-tags">
                      {opp.requiredExpertise?.slice(0, 3).map((exp, index) => (
                        <span key={index} className="expertise-tag">{exp}</span>
                      ))}
                      {opp.requiredExpertise?.length > 3 && (
                        <span className="expertise-tag more">+{opp.requiredExpertise.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="opportunity-actions">
                  <button 
                    className="view-details-btn lp-view-btn"
                    onClick={() => handleViewDetails(opp)}
                  >
                    View Full Details
                  </button>
                  <div className="apply-note">
                    <span>View full details to apply</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <div className="opportunity-modal-overlay" onClick={handleCloseDetails}>
          <div className="opportunity-modal lp-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedOpportunity.title}</h2>
              <button className="close-btn" onClick={handleCloseDetails}>×</button>
            </div>
            
            <div className="modal-content lp-modal-content">
              <div className="modal-meta">
                <div className="meta-item">
                  <strong>Company:</strong> {selectedOpportunity.companyName || 'Company'}
                </div>
                <div className="meta-item">
                  <strong>Posted:</strong> {formatDate(selectedOpportunity.createdAt)}
                </div>
                <div className="meta-item">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${getStatusBadgeClass(selectedOpportunity.status)}`}>
                    {selectedOpportunity.status}
                  </span>
                </div>
              </div>

              <div className="modal-section">
                <h3>Description</h3>
                <div className="description-content">
                  {selectedOpportunity.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>Required Expertise</h3>
                <div className="expertise-tags">
                  {selectedOpportunity.requiredExpertise?.map((exp, index) => (
                    <span key={index} className="expertise-tag">{exp}</span>
                  ))}
                </div>
              </div>

              <div className="modal-details-grid">
                <div className="detail-card">
                  <h4>Time Commitment</h4>
                  <p>{selectedOpportunity.timeCommitment}</p>
                </div>
                <div className="detail-card">
                  <h4>Compensation</h4>
                  <p>{selectedOpportunity.compensation}</p>
                </div>
              </div>

              {selectedOpportunity.status === 'open' && (
                <div className="application-section">
                  <h3>Ready to Apply?</h3>
                  <p>By applying, you'll be considered for this advisory opportunity. The company will review your profile and may reach out to discuss next steps.</p>
                </div>
              )}
            </div>

            <div className="modal-actions lp-modal-actions">
              <button className="cancel-btn" onClick={handleCloseDetails}>
                Close
              </button>
              {selectedOpportunity.status === 'open' && (
                <button 
                  className="apply-btn modal-apply-btn"
                  onClick={() => handleApply(selectedOpportunity.id)}
                  disabled={selectedOpportunity.hasApplied}
                >
                  {selectedOpportunity.hasApplied ? 'Applied ✓' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LPOpportunitiesPage;
