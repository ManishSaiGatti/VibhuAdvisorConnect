import { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../utils';
import '../../styles/opportunities/OpportunitiesPage.css';

function OpportunitiesPage({ onPostOpportunity, onEditOpportunity }) {
  const [activeSubTab, setActiveSubTab] = useState('browse');
  const [opportunities, setOpportunities] = useState([]);
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedOpportunityApplications, setSelectedOpportunityApplications] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
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
    if (activeSubTab === 'browse') {
      fetchAllOpportunities();
    } else if (activeSubTab === 'manage') {
      fetchMyOpportunities();
    }
  }, [activeSubTab]);

  // Removed auto-refresh to prevent stuttering/refreshing behavior
  // Users can manually refresh using the refresh button if needed

  const fetchAllOpportunities = async () => {
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

  const fetchMyOpportunities = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const response = await axios.get('http://localhost:3000/api/company/opportunities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyOpportunities(response.data);
    } catch (err) {
      setError('Failed to load your opportunities');
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
    fetchAllOpportunities();
  };

  const clearFilters = () => {
    setFilters({
      expertise: '',
      timeCommitment: '',
      search: ''
    });
    setTimeout(fetchAllOpportunities, 100);
  };

  const handleOpportunityStatusChange = async (opportunityId, newStatus) => {
    try {
      const token = getToken();
      await axios.patch(`http://localhost:3000/api/opportunities/${opportunityId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the opportunities list
      fetchMyOpportunities();
    } catch (err) {
      setError('Failed to update opportunity status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (opportunity) => {
    setSelectedOpportunity(opportunity);
  };

  const handleCloseDetails = () => {
    setSelectedOpportunity(null);
  };

  const handleViewApplications = async (opportunity) => {
    setSelectedOpportunityApplications(opportunity);
    setApplicationsLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`http://localhost:3000/api/opportunities/${opportunity.id}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
      
      // Update the opportunity count in local state to match actual count
      // This ensures the button shows the correct count even if the list hasn't been refreshed
      setMyOpportunities(prev => prev.map(opp => 
        opp.id === opportunity.id 
          ? { ...opp, applicantCount: response.data.length }
          : opp
      ));
    } catch (err) {
      setError('Failed to load applications');
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleCloseApplications = () => {
    setSelectedOpportunityApplications(null);
    setApplications([]);
  };

  const handleApplicationStatusChange = async (applicationId, newStatus) => {
    try {
      const token = getToken();
      await axios.patch(`http://localhost:3000/api/applications/${applicationId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh applications list
      if (selectedOpportunityApplications) {
        handleViewApplications(selectedOpportunityApplications);
      }
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (selectedOpportunityApplications) {
          handleCloseApplications();
        } else if (selectedOpportunity) {
          handleCloseDetails();
        }
      }
    };

    if (selectedOpportunity || selectedOpportunityApplications) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [selectedOpportunity, selectedOpportunityApplications]);

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
        <p>Discover and manage advisory opportunities in the vibhu.vc network</p>
      </div>

      <nav className="opportunities-nav">
        <button 
          className={`sub-tab ${activeSubTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('browse')}
        >
          Browse Opportunities
        </button>
        <button 
          className={`sub-tab ${activeSubTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('manage')}
        >
          My Opportunities
        </button>
      </nav>

      {error && (
        <div className="alert error">
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      {activeSubTab === 'browse' && (
        <div className="browse-opportunities">
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
              <p className="note">Note: As a company, you can view but not apply to other opportunities</p>
            </div>
            
            {opportunities.length === 0 ? (
              <div className="no-opportunities">
                <p>No opportunities found matching your criteria.</p>
              </div>
            ) : (
              <div className="opportunities-grid">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="opportunity-card browse-card">
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
                        className="view-details-btn company-view-btn"
                        onClick={() => handleViewDetails(opp)}
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'manage' && (
        <div className="manage-opportunities">
          <div className="manage-header">
            <h3>Your Posted Opportunities</h3>
            <div className="manage-actions">
              <button onClick={fetchMyOpportunities} className="refresh-btn">
                🔄 Refresh
              </button>
              <button onClick={onPostOpportunity} className="post-new-btn">
                + Post New Opportunity
              </button>
            </div>
          </div>

          {myOpportunities.length === 0 ? (
            <div className="no-opportunities">
              <h4>You haven't posted any opportunities yet</h4>
              <p>Click "Post New Opportunity" to create your first advisory opportunity posting.</p>
              <button onClick={onPostOpportunity} className="post-first-btn">
                Post Your First Opportunity
              </button>
            </div>
          ) : (
            <div className="my-opportunities-list">
              {myOpportunities.map((opp) => (
                <div key={opp.id} className="opportunity-card manage-card">
                  <div className="opportunity-header">
                    <h4>{opp.title}</h4>
                    <div className="header-actions">
                      <span className={`status-badge ${getStatusBadgeClass(opp.status)}`}>
                        {opp.status}
                      </span>
                      <select
                        value={opp.status}
                        onChange={(e) => handleOpportunityStatusChange(opp.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="filled">Filled</option>
                      </select>
                    </div>
                  </div>

                  <div className="opportunity-stats">
                    <div className="stat-item">
                      <span className="stat-number">{opp.viewCount || 0}</span>
                      <span className="stat-label">Views</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{opp.applicantCount || 0}</span>
                      <span className="stat-label">Applications</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-date">Posted {formatDate(opp.createdAt)}</span>
                    </div>
                  </div>

                  <p className="opportunity-description">
                    {opp.description.length > 200 
                      ? `${opp.description.substring(0, 200)}...` 
                      : opp.description}
                  </p>

                  <div className="opportunity-details">
                    <div className="detail-row">
                      <strong>Time Commitment:</strong> {opp.timeCommitment}
                    </div>
                    <div className="detail-row">
                      <strong>Compensation:</strong> {opp.compensation}
                    </div>
                    <div className="detail-row">
                      <strong>Required Expertise:</strong>
                      <div className="expertise-tags">
                        {opp.requiredExpertise?.map((exp, index) => (
                          <span key={index} className="expertise-tag">{exp}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="opportunity-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => onEditOpportunity(opp)}
                    >
                      Edit Opportunity
                    </button>
                    <button 
                      className="applications-btn"
                      onClick={() => handleViewApplications(opp)}
                    >
                      View Applications ({opp.applicantCount || 0})
                    </button>
                    <button className="analytics-btn">View Analytics</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <div className="opportunity-modal-overlay" onClick={handleCloseDetails}>
          <div className="opportunity-modal company-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedOpportunity.title}</h2>
              <button className="close-btn" onClick={handleCloseDetails}>×</button>
            </div>
            
            <div className="modal-content company-modal-content">
              <div className="modal-meta">
                <div className="meta-item">
                  <strong>Posted:</strong> {formatDate(selectedOpportunity.createdAt)}
                </div>
                <div className="meta-item">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${getStatusBadgeClass(selectedOpportunity.status)}`}>
                    {selectedOpportunity.status}
                  </span>
                </div>
                <div className="meta-item">
                  <strong>Applications:</strong> {selectedOpportunity.applicantCount || 0}
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
            </div>

            <div className="modal-actions company-modal-actions">
              <button className="cancel-btn" onClick={handleCloseDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {selectedOpportunityApplications && (
        <div className="opportunity-modal-overlay" onClick={handleCloseApplications}>
          <div className="opportunity-modal applications-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Applications for "{selectedOpportunityApplications.title}"</h2>
              <button className="close-btn" onClick={handleCloseApplications}>×</button>
            </div>
            
            <div className="modal-content applications-modal-content">
              {applicationsLoading ? (
                <div className="applications-loading">
                  <div className="spinner"></div>
                  <p>Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="no-applications">
                  <h3>No Applications Yet</h3>
                  <p>This opportunity hasn't received any applications yet. Applications will appear here as LPs apply.</p>
                </div>
              ) : (
                <div className="applications-list">
                  <div className="applications-header">
                    <h3>{applications.length} Application{applications.length !== 1 ? 's' : ''}</h3>
                  </div>
                  
                  {applications.map((app) => (
                    <div key={app.id} className="application-card">
                      <div className="application-header">
                        <div className="applicant-info">
                          <h4>{app.lpName}</h4>
                          <p className="applicant-email">{app.lpEmail}</p>
                        </div>
                        <div className="application-status">
                          <select
                            value={app.status}
                            onChange={(e) => handleApplicationStatusChange(app.id, e.target.value)}
                            className={`status-select application-status-${app.status}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="application-meta">
                        <div className="meta-item">
                          <strong>Applied:</strong> {formatDate(app.createdAt)}
                        </div>
                        {app.updatedAt !== app.createdAt && (
                          <div className="meta-item">
                            <strong>Last Updated:</strong> {formatDate(app.updatedAt)}
                          </div>
                        )}
                      </div>

                      <div className="application-actions">
                        <button 
                          className="view-profile-btn"
                          onClick={() => {/* TODO: View LP profile functionality */}}
                        >
                          View LP Profile
                        </button>
                        <button 
                          className="contact-btn"
                          onClick={() => window.open(`mailto:${app.lpEmail}`, '_blank')}
                        >
                          Contact LP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions applications-modal-actions">
              <button className="cancel-btn" onClick={handleCloseApplications}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OpportunitiesPage;
