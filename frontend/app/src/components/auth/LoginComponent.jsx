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
import { setAuthData } from '../../utils';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles form submission and authentication process.
   * 
   * Manages the complete login flow including:
   * - Form validation
   * - API authentication request
   * - Session data storage
   * - Success/error handling
   * - Loading state management
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Send authentication request to backend API
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      
      // Store authentication data in session storage
      setAuthData(res.data.token, res.data.user);
      
      // Notify parent component of successful login
      onLogin(res.data.user); // Pass user data to parent
    } catch (err) {
      // Display user-friendly error message
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      // Reset loading state regardless of outcome
      setLoading(false);
    }
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

          {/* Demo credentials information for testing */}
          <div className="demo-info">
            <p className="demo-title">Demo Access:</p>
            <p className="demo-text">
              <strong>Admin:</strong> admin@example.com / admin123<br/>
              <strong>LP:</strong> lp@example.com / lp123<br/>
              <strong>Company:</strong> company@example.com / company123
            </p>
          </div>

          {/* Main authentication form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email input field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Password input field */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Submit button with loading state */}
            <button
              type="submit"
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer information */}
          <p className="login-footer-text">
            This is an invite-only platform. Contact support if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
