/**
 * VibhuAdvisorConnect Backend Server
 * 
 * This is the main entry point for the VibhuAdvisorConnect backend application.
 * It sets up an Express.js server that provides REST API endpoints for managing
 * LP (Limited Partner) advisory connections with portfolio companies.
 * 
 * The application supports three main user roles:
 * - Admin: System administrators with full access
 * - LP: Limited Partners who provide advisory services
 * - Company: Portfolio companies seeking advisory services
 * 
 * Key Features:
 * - JWT-based authentication and authorization
 * - Role-based access control
 * - Opportunity management (posting and browsing advisory opportunities)
 * - Application system for LPs to apply to opportunities
 * - User profile management
 * - Dashboard analytics for all user types
 * 
 * Usage:
 * Start the server with: node server.js
 * The server will listen on the port specified in .env or default to 5000
 * Access the API at: http://localhost:PORT/api/[route]
 * 
 * API Routes:
 * - /api/auth: Authentication, login, and role-specific dashboards
 * - /api/admin: Administrative functions and system management
 * - /api/lp: LP-specific functionality (profiles, applications)
 * - /api/company: Company-specific functionality (profiles, opportunities)
 * - /api/opportunities: Opportunity browsing, creation, and management
 * - /api/applications: Application submission and management
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Middleware Setup
// Enable CORS for cross-origin requests from frontend
app.use(cors());

// Parse JSON request bodies (max 10mb)
app.use(express.json());

// API Route Registration
// Each route module handles specific functionality and enforces appropriate authentication/authorization

/**
 * Authentication Routes (/api/auth)
 * Handles user login, JWT token generation, and role-specific dashboard data
 */
app.use('/api/auth', require('./routes/authRoutes'));

/**
 * Admin Routes (/api/admin)
 * Provides administrative functions like user management, opportunity oversight,
 * system statistics, and application management. Requires Admin role.
 */
app.use('/api/admin', require('./routes/adminRoutes'));

/**
 * LP Routes (/api/lp)
 * Handles LP-specific functionality including profile management,
 * opportunity browsing, and application submission. Requires LP role.
 */
app.use('/api/lp', require('./routes/lpRoutes'));

/**
 * Company Routes (/api/company)
 * Manages company-specific features like profile updates and
 * viewing their posted opportunities. Requires Company role.
 */
app.use('/api/company', require('./routes/companyRoutes'));

/**
 * Opportunities Routes (/api/opportunities)
 * Handles opportunity creation, browsing, application, and management.
 * Access controlled based on user role and ownership.
 */
app.use('/api/opportunities', require('./routes/opportunitiesRoutes'));

/**
 * Applications Routes (/api/applications)
 * Manages application submission, status updates, and retrieval.
 * LPs can submit applications, Companies can manage them.
 */
app.use('/api/applications', require('./routes/applicationsRoutes'));

// Server Configuration
const PORT = process.env.PORT || 5000;

/**
 * Start the server
 * Listens on the specified port and logs the startup message
 */
app.listen(PORT, () => {
  console.log(`🚀 VibhuAdvisorConnect Server running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}/api`);
});
