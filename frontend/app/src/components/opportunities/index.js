/**
 * @fileoverview Opportunity management components barrel export.
 * 
 * This module exports all components related to advisory opportunity
 * management in the Vibhu Advisor Connect platform. These components
 * handle opportunity creation, viewing, editing, and interaction.
 * 
 * Components:
 * - PostOpportunity: Form for creating and editing advisory opportunities
 * - OpportunitiesPage: Company view for managing posted opportunities
 * - LPOpportunitiesPage: Limited Partner view for browsing opportunities
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

// Opportunity creation and editing form
export { default as PostOpportunity } from './PostOpportunity';

// Company-facing opportunity management interface
export { default as OpportunitiesPage } from './OpportunitiesPage';

// LP-facing opportunity browsing interface
export { default as LPOpportunitiesPage } from './LPOpportunitiesPage';
