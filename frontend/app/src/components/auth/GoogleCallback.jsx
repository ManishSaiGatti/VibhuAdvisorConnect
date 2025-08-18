/**
 * @fileoverview Google OAuth Callback component.
 * 
 * This component handles the callback from Google OAuth and processes
 * the authorization code to complete the authentication flow.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onAuthSuccess - Callback when authentication succeeds
 * @param {Function} props.onAuthError - Callback when authentication fails
 */

import { useEffect, useState } from 'react';
import axios from 'axios';

function GoogleCallback({ onAuthSuccess, onAuthError }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Google');
        }

        // Send the authorization code to backend
        const response = await axios.post('http://localhost:3000/api/auth/google/callback', {
          code
        });

        // Handle the response
        if (response.data.isNewUser) {
          // New user needs to complete setup
          onAuthSuccess(response.data.googleUser, true);
        } else {
          // Existing user, authentication complete
          onAuthSuccess(response.data.user, false);
        }

      } catch (err) {
        console.error('Google OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        onAuthError(err.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [onAuthSuccess, onAuthError]);

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Completing authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-error">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'}>
          Return to Home
        </button>
      </div>
    );
  }

  return null;
}

export default GoogleCallback;
