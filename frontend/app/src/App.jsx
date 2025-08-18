/**
 * @fileoverview Main application component for Vibhu Advisor Connect platform.
 * 
 * This is the root component that manages the entire application's state and routing.
 * It handles user authentication, view navigation, and renders appropriate components
 * based on user role and current application state.
 * 
 * The application supports three user roles:
 * - Admin: Platform administration and oversight
 * - LP (Limited Partner): Advisory services and opportunity review
 * - Company: Startup companies seeking advisory services
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { 
  LandingPage, 
  LoginComponent, 
  LPDashboard, 
  CompanyDashboard,
  AdminDashboard,
  PostOpportunity 
} from './components';
import AccountSetup from './components/auth/AccountSetup';
import GoogleCallback from './components/auth/GoogleCallback';
import { getToken, getUserData, clearAuthData } from './utils';
import { GOOGLE_AUTH_CONFIG } from './config/googleAuth';
import './styles/App.css';

/**
 * Main application component that orchestrates the entire platform experience.
 * 
 * This component manages:
 * - User authentication state
 * - Application view routing
 * - Role-based dashboard rendering
 * - Session persistence across browser refreshes
 * 
 * State Management:
 * - currentView: Controls which view/component is currently displayed
 * - isAuthenticated: Boolean flag for user authentication status
 * - user: Contains user data including role, email, and other profile information
 * - editingOpportunity: Holds opportunity data when editing existing opportunities
 * 
 * @returns {JSX.Element} The appropriate view component based on current state
 */
function App() {
  // Application state management
  const [currentView, setCurrentView] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [googleUser, setGoogleUser] = useState(null); // For account setup
  const [needsSetup, setNeedsSetup] = useState(false); // For first-time users

  /**
   * Authentication check and session restoration effect.
   * 
   * Runs on component mount to check if user is already authenticated
   * by examining session storage for existing tokens and user data.
   * If valid authentication data exists, automatically logs user in
   * and redirects to appropriate dashboard.
   * 
   * This ensures users don't need to re-login after browser refresh.
   */
  useEffect(() => {
    // Check if user is already logged in
    const token = getToken();
    const userData = getUserData();
    
    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }
  }, []);

  /**
   * Navigation handler: Landing page to login view.
   * 
   * Triggered when user clicks "Login to Platform" button on landing page.
   * Changes application view to display the login form.
   * 
   * Usage: Pass as onLoginClick prop to LandingPage component
   */
  const handleLoginClick = () => {
    setCurrentView('login');
  };

  /**
   * Authentication success handler.
   * 
   * Called when user successfully logs in through LoginComponent.
   * Updates application state with user data and redirects to dashboard.
   * 
   * @param {Object} userData - Complete user object from authentication response
   * @param {boolean} requiresSetup - Whether user needs to complete account setup
   * 
   * Usage: Pass as onLogin prop to LoginComponent
   */
  const handleLoginSuccess = (userData, requiresSetup = false) => {
    if (requiresSetup) {
      // New user needs account setup
      setGoogleUser(userData);
      setNeedsSetup(true);
      setCurrentView('accountSetup');
    } else {
      // Existing user, proceed to dashboard
      setUser(userData);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }
  };

  /**
   * Account setup completion handler.
   * 
   * Called when new user completes their account setup.
   * 
   * @param {Object} userData - Complete user object after setup
   */
  const handleSetupComplete = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setNeedsSetup(false);
    setGoogleUser(null);
    setCurrentView('dashboard');
  };

  /**
   * Handle returning from account setup to login
   */
  const handleBackFromSetup = () => {
    setNeedsSetup(false);
    setGoogleUser(null);
    setCurrentView('login');
  };

  /**
   * Check if current URL is Google OAuth callback
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code') && window.location.pathname === '/auth/google/callback') {
      setCurrentView('googleCallback');
    }
  }, []);

  /**
   * Navigation handler: Return to landing page.
   * 
   * Allows users to return to the main landing page from login view.
   * Typically used when user wants to cancel login process.
   * 
   * Usage: Pass as onBack prop to LoginComponent
   */
  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  /**
   * Navigation handler: Create new opportunity.
   * 
   * Switches view to opportunity posting form for creating new opportunities.
   * Clears any existing editing state to ensure clean form initialization.
   * Only accessible to users with 'Company' role.
   * 
   * Usage: Pass as onPostOpportunity prop to CompanyDashboard
   */
  const handlePostOpportunity = () => {
    setEditingOpportunity(null); // Clear any editing state
    setCurrentView('postOpportunity');
  };

  /**
   * Navigation handler: Edit existing opportunity.
   * 
   * Switches to opportunity posting form with pre-populated data for editing.
   * Sets the opportunity data in state for form initialization.
   * Only accessible to users with 'Company' role.
   * 
   * @param {Object} opportunity - Complete opportunity object to edit
   * @param {string} opportunity.id - Unique opportunity identifier
   * @param {string} opportunity.title - Opportunity title
   * @param {string} opportunity.description - Detailed description
   * 
   * Usage: Pass as onEditOpportunity prop to CompanyDashboard
   */
  const handleEditOpportunity = (opportunity) => {
    setEditingOpportunity(opportunity);
    setCurrentView('postOpportunity');
  };

  /**
   * Navigation handler: Return to dashboard from opportunity form.
   * 
   * Returns user to their role-appropriate dashboard and clears
   * any opportunity editing state.
   * 
   * Usage: Pass as onBack prop to PostOpportunity component
   */
  const handleBackToDashboard = () => {
    setEditingOpportunity(null); // Clear editing state when going back
    setCurrentView('dashboard');
  };

  /**
   * Success handler: Opportunity create/update completion.
   * 
   * Called when opportunity is successfully created or updated.
   * Returns user to dashboard and clears editing state.
   * 
   * Usage: Pass as onSuccess prop to PostOpportunity component
   */
  const handleOpportunitySuccess = () => {
    setEditingOpportunity(null); // Clear editing state after success
    setCurrentView('dashboard');
  };

  /**
   * Logout handler: Complete session termination.
   * 
   * Performs complete logout by:
   * 1. Clearing authentication data from session storage
   * 2. Resetting all user-related state
   * 3. Redirecting to landing page
   * 
   * This ensures secure logout and prevents unauthorized access
   * to protected areas of the application.
   * 
   * Usage: Pass as onLogout prop to all dashboard components
   */
  const handleLogout = () => {
    // Clear tokens and user data
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('landing');
    console.log('User logged out, data cleared');
  };

  /**
   * Role-based dashboard renderer.
   * 
   * Determines which dashboard component to render based on the user's role.
   * Each role has access to different features and data:
   * 
   * - Admin: Platform oversight, user management, system analytics
   * - LP: Portfolio review, advisory opportunities, expert matching
   * - Company: Opportunity posting, advisor search, profile management
   * 
   * @returns {JSX.Element|null} The appropriate dashboard component or null if no user
   */
  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'Admin':
        return <AdminDashboard onLogout={handleLogout} />;
      case 'LP':
        return <LPDashboard onLogout={handleLogout} />;
      case 'Company':
        return <CompanyDashboard 
          onLogout={handleLogout} 
          onPostOpportunity={handlePostOpportunity}
          onEditOpportunity={handleEditOpportunity}
        />;
      default:
        return <div>Unknown user role</div>;
    }
  };

  // Development debugging logs - can be removed in production
  console.log('Current view:', currentView);
  console.log('Is authenticated:', isAuthenticated);
  console.log('User:', user);

  /**
   * Conditional rendering logic based on application state.
   * 
   * The application renders different components based on:
   * 1. Current view state (login, postOpportunity, dashboard, landing, accountSetup, googleCallback)
   * 2. User authentication status
   * 3. User role permissions
   * 
   * Rendering priority:
   * 1. Google OAuth callback handler
   * 2. Account setup for new users
   * 3. Login form (when currentView === 'login')
   * 4. Opportunity posting (when authenticated Company user in postOpportunity view)
   * 5. Role-based dashboard (when authenticated user in dashboard view)
   * 6. Landing page (default fallback)
   */

  // Handle Google OAuth callback
  if (currentView === 'googleCallback') {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_AUTH_CONFIG.clientId}>
        <GoogleCallback 
          onAuthSuccess={handleLoginSuccess}
          onAuthError={(error) => {
            console.error('Google auth error:', error);
            setCurrentView('login');
          }}
        />
      </GoogleOAuthProvider>
    );
  }

  // Render account setup for new users
  if (currentView === 'accountSetup' && needsSetup && googleUser) {
    return (
      <AccountSetup
        googleUser={googleUser}
        onSetupComplete={handleSetupComplete}
        onBack={handleBackFromSetup}
      />
    );
  }

  // Render login component
  if (currentView === 'login') {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_AUTH_CONFIG.clientId}>
        <LoginComponent 
          onLogin={handleLoginSuccess}
          onBack={handleBackToLanding}
        />
      </GoogleOAuthProvider>
    );
  }

  // Render opportunity posting form (Company role only)
  if (currentView === 'postOpportunity' && isAuthenticated && user?.role === 'Company') {
    return (
      <PostOpportunity 
        onBack={handleBackToDashboard}
        onSuccess={handleOpportunitySuccess}
        editingOpportunity={editingOpportunity}
      />
    );
  }

  // Render role-based dashboard
  if (currentView === 'dashboard' && isAuthenticated && user) {
    return renderDashboard();
  }

  // Default: render landing page
  return (
    <GoogleOAuthProvider clientId={GOOGLE_AUTH_CONFIG.clientId}>
      <LandingPage onLoginClick={handleLoginClick} />
    </GoogleOAuthProvider>
  );
}

export default App;