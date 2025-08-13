/**
 * @fileoverview Dashboard components barrel export.
 * 
 * This module exports all role-based dashboard components for the
 * Vibhu Advisor Connect platform. Each dashboard provides specific
 * functionality tailored to different user roles.
 * 
 * Components:
 * - AdminDashboard: Platform administration, user management, analytics
 * - LPDashboard: Limited Partner advisory services and portfolio management
 * - CompanyDashboard: Startup company opportunity posting and advisor search
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

// Platform administration dashboard
export { default as AdminDashboard } from './AdminDashboard.jsx';

// Limited Partner (advisor) dashboard
export { default as LPDashboard } from './LPDashboard.jsx';

// Company (startup) dashboard
export { default as CompanyDashboard } from './CompanyDashboard.jsx';
