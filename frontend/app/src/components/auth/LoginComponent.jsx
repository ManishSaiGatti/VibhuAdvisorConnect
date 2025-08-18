/**
 * @fileoverview Login component for user authentication.
 * 
 * This component provides a comprehensive login interface for the Vibhu Advisor Connect
 * platform. It handles user authentication for all role types (Admin, LP, Company) 
 * and manages the complete login flow including form validation, API communication,
 * and error handling.
 * 
 * Features:
 * - Role-agnostic authentication (Admin, LP, Company users)
 * - Form validation and error handling
 * - Loading states during authentication
 * - Demo credentials display for testing
 * - Responsive design with professional styling
 * - Navigation back to landing page
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onLogin - Callback function called with user data on successful login
 * @param {Function} props.onBack - Callback function called when user wants to return to landing page
 * 
 * @example
 * ```jsx
 * <LoginComponent 
 *   onLogin={(userData) => handleLoginSuccess(userData)}
 *   onBack={() => setCurrentView('landing')}
 * />
 * ```
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

import { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { setAuthData } from '../../utils';
import { GOOGLE_AUTH_CONFIG } from '../../config/googleAuth';
import '../../styles/components/LoginComponent.css';

/**
 * Login form component with comprehensive authentication handling.
 * 
 * This component manages the complete user login experience, including
 * form state management, API authentication, session storage, and
 * error handling. It supports all user roles and provides demo credentials
 * for testing purposes.
 * 
 * Authentication Flow:
 * 1. User enters email and password
 * 2. Form validation prevents submission if fields are empty
 * 3. API request sent to authentication endpoint
 * 4. On success: Store token and user data, call onLogin callback
 * 5. On error: Display user-friendly error message
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onLogin - Success callback with user data parameter
 * @param {Function} props.onBack - Navigation callback to return to landing page
 * @returns {JSX.Element} Rendered login form component
 */
function Login({ onLogin, onBack }) {
  // Form state management
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle successful Google OAuth login
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    
    try {
      // Send Google credential to backend for verification
      const response = await axios.post('http://localhost:3000/api/auth/google/login', {
        credential: credentialResponse.credential
      });
      
      if (response.data.isNewUser) {
        // New user needs to complete setup
        onLogin(response.data.googleUser, true); // Pass true to indicate setup needed
      } else {
        // Existing user, store auth data and proceed
        setAuthData(response.data.token, response.data.user);
        onLogin(response.data.user, false); // Pass false to indicate no setup needed
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth login failure
   */
  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  /**
   * Render the complete login interface.
   * 
   * The login interface includes:
   * - Header with navigation back to landing page
   * - Login form with email and password fields
   * - Error message display area
   * - Demo credentials information
   * - Loading states and form validation
   * - Professional styling and responsive design
   */
  return (
    <div className="login-container">
      {/* Header section with branding and navigation */}
      <header className="login-header">
        <div className="login-header-content">
          {/* Conditional back button - only show if onBack callback provided */}
          {onBack && (
            <button className="back-button" onClick={onBack}>
              ← Back to Home
            </button>
          )}
          <h1 className="login-header-title">Vibhu Advisor Connect</h1>
        </div>
      </header>

      {/* Main login form container */}
      <div className="login-form-container">
        <div className="login-card">
          {/* Form header with welcome message */}
          <div className="login-form-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">
              Sign in to access the Vibhu Advisor Connect platform
            </p>
          </div>

          {/* Error message display - only shown when error exists */}
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          {/* Google Sign-In Section */}
          <div className="google-signin-container">
            <div className="signin-header">
              <h3>Sign in with Google</h3>
              <p>Use your Google account to access the platform</p>
            </div>
            
            <div className="google-signin-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                locale="en"
                disabled={loading}
              />
            </div>

            {loading && (
              <div className="loading-message">
                <span className="loading-spinner"></span>
                Signing you in...
              </div>
            )}
          </div>

          {/* Information section */}
          <div className="platform-info">
            <h4>Platform Access</h4>
            <p>
              <strong>Limited Partners:</strong> Provide advisory services to portfolio companies<br/>
              <strong>Companies:</strong> Seek advisory services for your startup
            </p>
            <p className="note">
              New users will be prompted to set up their account after signing in.
            </p>
          </div>

          {/* Footer information */}
          <p className="login-footer-text">
            This platform connects Limited Partners with startups for advisory relationships.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
