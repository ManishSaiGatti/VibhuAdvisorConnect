/**
 * @fileoverview Authentication components barrel export.
 * 
 * This module exports all authentication-related React components
 * for the Vibhu Advisor Connect platform. These components handle
 * user login, session management, and route protection.
 * 
 * Components:
 * - LoginComponent: Main authentication form with role-based login
 * - ProtectedComponent: Route guard for authenticated-only content
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

// Main authentication form component
export { default as LoginComponent } from './LoginComponent.jsx';

// Route protection component for authenticated content
export { default as ProtectedComponent } from './ProtectedComponent.jsx';
