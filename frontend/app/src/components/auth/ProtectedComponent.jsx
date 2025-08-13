/**
 * @fileoverview Protected route component for authenticated users.
 * 
 * This component serves as a protected route guard and basic dashboard
 * for authenticated users. It verifies user authentication status,
 * handles authorization failures, and provides a generic authenticated
 * user interface.
 * 
 * Features:
 * - Authentication verification on component mount
 * - Loading states during verification
 * - Error handling for authentication failures
 * - Generic authenticated user dashboard
 * - Logout functionality with proper cleanup
 * 
 * Note: This appears to be a legacy/demo component. Most functionality
 * has been moved to role-specific dashboard components (AdminDashboard,
 * LPDashboard, CompanyDashboard).
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onLogout - Callback function for logout handling
 * 
 * @example
 * ```jsx
 * <ProtectedComponent onLogout={() => handleLogout()} />
 * ```
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken, clearAuthData } from '../../utils';
import '../../styles/components/ProtectedComponent.css';

/**
 * Protected component that verifies authentication and provides basic dashboard.
 * 
 * This component performs authentication verification and renders appropriate
 * content based on the user's authentication status. It handles loading states,
 * error conditions, and provides a fallback dashboard interface.
 * 
 * Authentication Flow:
 * 1. Component mounts and retrieves stored token
 * 2. Makes request to protected endpoint to verify token validity
 * 3. On success: Displays authenticated user interface
 * 4. On failure: Shows error message and logout option
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onLogout - Handler called when user logs out
 * @returns {JSX.Element} Rendered protected component based on auth status
 */
function ProtectedComponent({ onLogout }) {
  // Component state management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Authentication verification effect.
   * 
   * Runs on component mount to verify the user's authentication status
   * by making a request to the protected endpoint. Handles both success
   * and failure scenarios appropriately.
   */
  useEffect(() => {
    const token = getToken();
    
    // Verify token validity with backend
    axios.get('http://localhost:3000/api/auth/protected', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      // Authentication successful
      setData(res.data);
      setLoading(false);
    }).catch(() => {
      // Authentication failed
      setError('Not authorized');
      setLoading(false);
    });
  }, []);

  /**
   * Logout handler with fallback behavior.
   * 
   * Handles user logout by calling the provided onLogout callback
   * or falling back to direct session cleanup and page reload.
   */
  const handleLogout = () => {
    if (onLogout) {
      // Use provided logout handler (preferred)
      onLogout();
    } else {
      // Fallback logout behavior
      clearAuthData();
      window.location.reload();
    }
  };

  /**
   * Loading state rendering.
   * 
   * Displays a loading spinner and message while authentication
   * verification is in progress.
   */
  if (loading) {
    return (
      <div className="protected-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  /**
   * Error state rendering.
   * 
   * Displays error message and logout option when authentication
   * verification fails or user is not authorized.
   */
  if (error) {
    return (
      <div className="protected-container">
        <div className="error-container">
          <div className="error-alert">
            <span className="error-icon">⚠</span>
            {error}
          </div>
          <button className="logout-button error-logout" onClick={handleLogout}>
            Back to Landing
          </button>
        </div>
      </div>
    );
  }

  /**
   * Authenticated user interface.
   * 
   * Renders the main protected dashboard interface for authenticated users.
   * Includes welcome message, user information, and action buttons for
   * platform features.
   */
  return (
    <div className="protected-container">
      {/* Header with logout functionality */}
      <div className="protected-header">
        <h1 className="dashboard-title">VentureConnect Dashboard</h1>
        <button className="logout-button-header" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      {/* Main content area */}
      <div className="protected-content">
        {/* Welcome section */}
        <div className="success-card">
          <h2 className="success-title">🎉 Successfully Logged In!</h2>
          <p className="success-text">
            Welcome back, {data?.user?.email}!
          </p>
          <p className="success-message">
            {data?.message || 'You have access to the VentureConnect platform.'}
          </p>
        </div>

        {/* Action buttons section */}
        <div className="action-buttons">
          <p className="action-description">
            You now have access to our network of Limited Partners ready to provide 
            strategic guidance to early-stage startups.
          </p>
          
          {/* Platform feature buttons */}
          <button className="action-button blue">
            Browse Network
          </button>
          
          <button className="action-button green">
            Find Advisory Matches
          </button>
          
          <button className="action-button purple">
            Schedule Meetings
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProtectedComponent;