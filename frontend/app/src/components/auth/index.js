/**
 * @fileoverview Authentication components barrel export.
 * 
 * This module exports all authentication-related React components
 * for the Vibhu Advisor Connect platform. These components handle
 * user login, session management, Google OAuth, and route protection.
 * 
 * Components:
 * - LoginComponent: Main authentication form with Google OAuth
 * - ProtectedComponent: Route guard for authenticated-only content
 * - AccountSetup: First-time user account setup
 * - GoogleCallback: Google OAuth callback handler
 * 
 * @author Vibhu Advisor Connect Team
 * @version 2.0.0
 */

// Main authentication form component
export { default as LoginComponent } from './LoginComponent.jsx';

// Route protection component for authenticated content
export { default as ProtectedComponent } from './ProtectedComponent.jsx';

// Account setup component for new users
export { default as AccountSetup } from './AccountSetup.jsx';

// Google OAuth callback handler
export { default as GoogleCallback } from './GoogleCallback.jsx';
