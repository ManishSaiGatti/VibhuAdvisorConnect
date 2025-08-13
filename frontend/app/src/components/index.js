/**
 * @fileoverview Main component barrel export file.
 * 
 * This module serves as the central export point for all React components
 * in the Vibhu Advisor Connect application. It provides a clean, organized
 * way to import components from different feature areas.
 * 
 * Component Categories:
 * - auth: Authentication-related components (login, protected routes)
 * - dashboards: Role-based dashboard components (Admin, LP, Company)
 * - common: Shared components used across the application
 * - opportunities: Opportunity management components (post, view, edit)
 * 
 * Usage Example:
 * ```javascript
 * import { 
 *   LoginComponent, 
 *   AdminDashboard, 
 *   LandingPage, 
 *   PostOpportunity 
 * } from './components';
 * ```
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

// Authentication components - Login forms, protected routes, session management
export * from './auth';

// Dashboard components - Role-specific dashboards and management interfaces  
export * from './dashboards';

// Common components - Shared UI elements and page components
export * from './common';

// Opportunity components - Advisory opportunity management and interaction
export * from './opportunities';
