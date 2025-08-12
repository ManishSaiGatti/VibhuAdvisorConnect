import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken, clearAuthData } from '../../utils';
import '../../styles/components/ProtectedComponent.css';

function ProtectedComponent({ onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    axios.get('http://localhost:3000/api/auth/protected', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => {
      setError('Not authorized');
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if onLogout prop is not provided
      clearAuthData();
      window.location.reload();
    }
  };

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

  return (
    <div className="protected-container">
      <div className="protected-header">
        <h1 className="dashboard-title">VentureConnect Dashboard</h1>
        <button className="logout-button-header" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="protected-content">
        <div className="success-card">
          <h2 className="success-title">🎉 Successfully Logged In!</h2>
          <p className="success-text">
            Welcome back, {data?.user?.email}!
          </p>
          <p className="success-message">
            {data?.message || 'You have access to the VentureConnect platform.'}
          </p>
        </div>

        <div className="action-buttons">
          <p className="action-description">
            You now have access to our network of Limited Partners ready to provide 
            strategic guidance to early-stage startups.
          </p>
          
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