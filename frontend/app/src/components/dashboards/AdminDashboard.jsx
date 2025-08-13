/**
 * @fileoverview Admin Dashboard component for platform administration.
 * 
 * This component provides a comprehensive administrative interface for platform
 * management in the Vibhu Advisor Connect system. It offers tools for user
 * management, opportunity oversight, system analytics, and platform administration.
 * 
 * Features:
 * - User management (view, filter, manage all platform users)
 * - Opportunity oversight (monitor and manage posted opportunities)
 * - System analytics and dashboard metrics
 * - Tabbed interface for organized navigation
 * - Real-time data filtering and search
 * - Administrative actions and controls
 * 
 * Access Control:
 * - Restricted to users with 'Admin' role
 * - Requires valid authentication token
 * - Protected API endpoints for sensitive operations
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onLogout - Callback function for user logout
 * 
 * @example
 * ```jsx
 * <AdminDashboard onLogout={() => handleLogout()} />
 * ```
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils';
import '../../styles/dashboards/AdminDashboard.css';

/**
 * Admin dashboard component with comprehensive platform management tools.
 * 
 * This component provides a multi-tabbed interface for platform administration,
 * including user management, opportunity oversight, and system analytics.
 * It fetches and manages data from multiple API endpoints to provide a
 * complete administrative view.
 * 
 * State Management:
 * - data: Main dashboard overview data and metrics
 * - users: Complete list of platform users with filtering
 * - opportunities: All opportunities posted on the platform
 * - activeTab: Current active tab in the interface
 * - Filter states: Various filters for data views
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onLogout - Handler for user logout action
 * @returns {JSX.Element} Rendered admin dashboard component
 */
function AdminDashboard({ onLogout }) {
  // Main component state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data management state
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  
  // Filter state for users
  const [userFilter, setUserFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Filter state for opportunities
  const [opportunityFilter, setOpportunityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  /**
   * Admin data fetching effect.
   * 
   * Fetches comprehensive administrative data on component mount:
   * 1. Dashboard overview data (metrics, analytics)
   * 2. Complete user list for management
   * 3. All opportunities for oversight
   * 
   * All requests use authentication tokens for security.
   * Handles errors gracefully and updates loading states.
   */
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = getToken();
        
        // Fetch dashboard overview data with platform metrics
        const dashboardResponse = await axios.get('http://localhost:3000/api/auth/dashboard/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(dashboardResponse.data);
        
        // Fetch complete user list for user management
        const usersResponse = await axios.get('http://localhost:3000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersResponse.data);
        
        // Fetch all opportunities for administrative oversight
        const opportunitiesResponse = await axios.get('http://localhost:3000/api/admin/opportunities', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOpportunities(opportunitiesResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load admin dashboard');
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Handle user status toggle
  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      const token = getToken();
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      await axios.patch(`http://localhost:3000/api/admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  // Handle opportunity status change
  const handleOpportunityStatusChange = async (opportunityId, newStatus) => {
    try {
      const token = getToken();
      
      await axios.patch(`http://localhost:3000/api/admin/opportunities/${opportunityId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setOpportunities(opportunities.map(opp => 
        opp.id === opportunityId ? { ...opp, status: newStatus } : opp
      ));
    } catch (err) {
      setError('Failed to update opportunity status');
    }
  };

  // Handle opportunity deletion
  const handleOpportunityDelete = async (opportunityId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) {
      return;
    }
    
    try {
      const token = getToken();
      
      await axios.delete(`http://localhost:3000/api/admin/opportunities/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setOpportunities(opportunities.filter(opp => opp.id !== opportunityId));
    } catch (err) {
      setError('Failed to delete opportunity');
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(userFilter.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(userFilter.toLowerCase()) ||
                         user.email.toLowerCase().includes(userFilter.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter opportunities based on search and status filter
  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(opportunityFilter.toLowerCase()) ||
                         opportunity.companyName.toLowerCase().includes(opportunityFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || opportunity.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
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
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>VC Network Admin Dashboard</h1>
          <p>Manage platform users and advisory opportunities</p>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`nav-tab ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          Opportunities
        </button>
      </nav>

      <main className="admin-main">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Platform Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{data?.totalUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Active Opportunities</h3>
                <p className="stat-number">{data?.activeOpportunities || 0}</p>
              </div>
              <div className="stat-card">
                <h3>LP Advisors</h3>
                <p className="stat-number">{data?.lpAdvisors || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Portfolio Companies</h3>
                <p className="stat-number">{data?.portfolioCompanies || 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>User Management</h2>
              <div className="filters">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="search-input"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Roles</option>
                  <option value="LP">LP Advisor</option>
                  <option value="Company">Portfolio Company</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role === 'LP' ? 'LP Advisor' : user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`action-button ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                          onClick={() => handleUserStatusToggle(user.id, user.status)}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="no-results">
                  <p>No users found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="opportunities-section">
            <div className="section-header">
              <h2>Opportunity Management</h2>
              <div className="filters">
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={opportunityFilter}
                  onChange={(e) => setOpportunityFilter(e.target.value)}
                  className="search-input"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div className="opportunities-table-container">
              <table className="opportunities-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map(opportunity => (
                    <tr key={opportunity.id}>
                      <td>{opportunity.title}</td>
                      <td>{opportunity.companyName}</td>
                      <td>
                        <select
                          value={opportunity.status}
                          onChange={(e) => handleOpportunityStatusChange(opportunity.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td>{new Date(opportunity.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-button edit"
                            onClick={() => {/* TODO: Implement edit functionality */}}
                          >
                            Edit
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => handleOpportunityDelete(opportunity.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOpportunities.length === 0 && (
                <div className="no-results">
                  <p>No opportunities found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
