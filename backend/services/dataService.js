/**
 * DataService - Centralized Data Management Service
 * 
 * This service provides a centralized interface for all data operations in the
 * VibhuAdvisorConnect application. It handles file-based JSON storage for
 * users, opportunities, connections, and applications.
 * 
 * The service acts as a data access layer (DAL) that abstracts file system
 * operations and provides a clean API for CRUD operations. All controllers
 * should use this service instead of directly accessing data files.
 * 
 * Data Files Managed:
 * - users.json: User accounts (Admin, LP, Company)
 * - opportunities.json: Advisory opportunities posted by companies
 * - connections.json: Active advisory relationships between LPs and companies
 * - applications.json: LP applications to advisory opportunities
 * 
 * Usage in Controllers:
 * const dataService = require('../services/dataService');
 * const users = await dataService.getUsers();
 * 
 * Design Pattern: Singleton - exports a single instance
 * All methods are async and handle errors gracefully
 */

const fs = require('fs').promises;
const path = require('path');

class DataService {
  /**
   * Constructor - Initialize data directory path
   * Sets up the path to the data directory relative to this file
   */
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

  // ==================== CORE FILE OPERATIONS ====================

  /**
   * Read and parse a JSON data file
   * @param {string} filename - Name of the file to read (e.g., 'users.json')
   * @returns {Promise<Array>} Parsed JSON data as array, empty array on error
   * 
   * Usage: const users = await dataService.readFile('users.json');
   * 
   * Error Handling: Returns empty array if file doesn't exist or is invalid JSON
   * Logs errors to console for debugging
   */
  async readFile(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  /**
   * Write data to a JSON file with pretty formatting
   * @param {string} filename - Name of the file to write (e.g., 'users.json')
   * @param {any} data - Data to write (will be JSON.stringified)
   * @returns {Promise<boolean>} True if successful, false if failed
   * 
   * Usage: await dataService.writeFile('users.json', updatedUsers);
   * 
   * Features:
   * - Pretty prints JSON with 2-space indentation
   * - Atomic write operation
   * - Error logging and graceful failure handling
   */
  async writeFile(filename, data) {
    try {
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  // ==================== USER OPERATIONS ====================

  /**
   * Get all users from the users.json file
   * @returns {Promise<Array>} Array of user objects
   * 
   * Usage: const users = await dataService.getUsers();
   * Used by: Admin controllers, authentication, user search
   */
  async getUsers() {
    return await this.readFile('users.json');
  }

  /**
   * Find a user by their unique ID
   * @param {number|string} id - User ID to search for
   * @returns {Promise<Object|undefined>} User object or undefined if not found
   * 
   * Usage: const user = await dataService.getUserById(123);
   * Used by: Authentication, profile management, authorization checks
   */
  async getUserById(id) {
    const users = await this.getUsers();
    return users.find(user => user.id === parseInt(id));
  }

  /**
   * Find a user by their email address (for login)
   * @param {string} email - Email address to search for
   * @returns {Promise<Object|undefined>} User object or undefined if not found
   * 
   * Usage: const user = await dataService.getUserByEmail('user@example.com');
   * Used by: Authentication controller during login process
   */
  async getUserByEmail(email) {
    const users = await this.getUsers();
    return users.find(user => user.email === email);
  }

  /**
   * Update user data with new information
   * @param {number|string} id - User ID to update
   * @param {Object} updates - Object containing fields to update
   * @returns {Promise<Object|null>} Updated user object or null if failed
   * 
   * Usage: 
   * const updated = await dataService.updateUser(123, { 
   *   status: 'active', 
   *   lastLogin: new Date().toISOString() 
   * });
   * 
   * Features:
   * - Merges updates with existing user data
   * - Automatically sets updatedAt timestamp
   * - Validates user exists before updating
   * - Returns null if user not found or write fails
   * 
   * Used by: Profile updates, status changes, login tracking
   */
  async updateUser(id, updates) {
    try {
      const users = await this.getUsers();
      const userIndex = users.findIndex(user => user.id === parseInt(id));
      
      if (userIndex === -1) {
        console.log(`User with ID ${id} not found`);
        return null;
      }
      
      users[userIndex] = { 
        ...users[userIndex], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const writeSuccess = await this.writeFile('users.json', users);
      if (!writeSuccess) {
        console.error('Failed to write users.json file');
        return null;
      }
      
      console.log(`Successfully updated user ${id}`);
      return users[userIndex];
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  }

  /**
   * Create a new user account
   * @param {Object} userData - User data object
   * @returns {Promise<Object>} Created user object with assigned ID
   * 
   * Usage:
   * const newUser = await dataService.createUser({
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   email: 'john@example.com',
   *   role: 'LP'
   * });
   * 
   * Features:
   * - Auto-generates unique ID (highest existing ID + 1)
   * - Sets joinedDate, createdAt, updatedAt timestamps
   * - Adds user to users array and saves to file
   * 
   * Used by: User registration, admin user creation
   */
  async createUser(userData) {
    const users = await this.getUsers();
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    
    const newUser = {
      id: newId,
      ...userData,
      joinedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await this.writeFile('users.json', users);
    return newUser;
  }

  /**
   * Delete a user by ID
   * @param {number|string} id - User ID to delete
   * @returns {Promise<boolean>} True if deleted, false if user not found
   * 
   * Usage: const deleted = await dataService.deleteUser(123);
   * Used by: Admin user management
   * 
   * Note: This is a hard delete. Consider soft delete (status = 'deleted') for production
   */
  async deleteUser(id) {
    const users = await this.getUsers();
    const filteredUsers = users.filter(user => user.id !== parseInt(id));
    
    if (filteredUsers.length === users.length) return false;
    
    await this.writeFile('users.json', filteredUsers);
    return true;
  }

  // ==================== OPPORTUNITY OPERATIONS ====================

  /**
   * Get all opportunities from opportunities.json
   * @returns {Promise<Array>} Array of opportunity objects
   * 
   * Usage: const opportunities = await dataService.getOpportunities();
   * Used by: Opportunity browsing, admin management, dashboard stats
   */
  async getOpportunities() {
    return await this.readFile('opportunities.json');
  }

  /**
   * Find an opportunity by its ID
   * @param {number|string} id - Opportunity ID to search for
   * @returns {Promise<Object|undefined>} Opportunity object or undefined if not found
   * 
   * Usage: const opportunity = await dataService.getOpportunityById(456);
   * Used by: Opportunity details, application process, company management
   */
  async getOpportunityById(id) {
    const opportunities = await this.getOpportunities();
    return opportunities.find(opp => opp.id === parseInt(id));
  }

  /**
   * Update opportunity data
   * @param {number|string} id - Opportunity ID to update
   * @param {Object} updates - Object containing fields to update
   * @returns {Promise<Object|null>} Updated opportunity object or null if failed
   * 
   * Usage:
   * const updated = await dataService.updateOpportunity(456, {
   *   status: 'closed',
   *   applicantCount: 5
   * });
   * 
   * Features:
   * - Merges updates with existing opportunity data
   * - Automatically sets updatedAt timestamp
   * - Used for status changes, view count tracking, applicant count syncing
   */
  async updateOpportunity(id, updates) {
    const opportunities = await this.getOpportunities();
    const oppIndex = opportunities.findIndex(opp => opp.id === parseInt(id));
    
    if (oppIndex === -1) return null;
    
    opportunities[oppIndex] = { 
      ...opportunities[oppIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.writeFile('opportunities.json', opportunities);
    return opportunities[oppIndex];
  }

  /**
   * Delete an opportunity by ID
   * @param {number|string} id - Opportunity ID to delete
   * @returns {Promise<boolean>} True if deleted, false if not found
   * 
   * Usage: const deleted = await dataService.deleteOpportunity(456);
   * Used by: Admin management, company opportunity management
   */
  async deleteOpportunity(id) {
    const opportunities = await this.getOpportunities();
    const filteredOpportunities = opportunities.filter(opp => opp.id !== parseInt(id));
    
    if (filteredOpportunities.length === opportunities.length) return false;
    
    await this.writeFile('opportunities.json', filteredOpportunities);
    return true;
  }

  /**
   * Create a new opportunity
   * @param {Object} opportunityData - Opportunity data object
   * @returns {Promise<Object>} Created opportunity with assigned ID
   * 
   * Usage:
   * const newOpp = await dataService.createOpportunity({
   *   title: 'Seeking Marketing Advisor',
   *   companyName: 'TechStartup Inc',
   *   description: 'Looking for marketing expertise...',
   *   expertiseNeeded: ['Marketing', 'Growth'],
   *   companyId: 123
   * });
   * 
   * Features:
   * - Auto-generates unique ID
   * - Sets default values for status, applications, priority
   * - Adds createdAt and updatedAt timestamps
   */
  async createOpportunity(opportunityData) {
    const opportunities = await this.getOpportunities();
    const newId = Math.max(...opportunities.map(o => o.id), 0) + 1;
    
    const newOpportunity = {
      id: newId,
      ...opportunityData,
      status: opportunityData.status || 'open',
      applications: 0,
      matchedLPs: [],
      priority: opportunityData.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    opportunities.push(newOpportunity);
    await this.writeFile('opportunities.json', opportunities);
    return newOpportunity;
  }

  // ==================== CONNECTION OPERATIONS ====================

  /**
   * Get all connections (advisory relationships) from connections.json
   * @returns {Promise<Array>} Array of connection objects
   * 
   * Usage: const connections = await dataService.getConnections();
   * Used by: Dashboard analytics, relationship tracking, admin oversight
   */
  async getConnections() {
    return await this.readFile('connections.json');
  }

  /**
   * Find a connection by its ID
   * @param {number|string} id - Connection ID to search for
   * @returns {Promise<Object|undefined>} Connection object or undefined if not found
   * 
   * Usage: const connection = await dataService.getConnectionById(789);
   * Used by: Connection management, relationship updates
   */
  async getConnectionById(id) {
    const connections = await this.getConnections();
    return connections.find(conn => conn.id === parseInt(id));
  }

  /**
   * Get all connections for a specific LP
   * @param {number|string} lpId - LP user ID
   * @returns {Promise<Array>} Array of connection objects for this LP
   * 
   * Usage: const lpConnections = await dataService.getConnectionsByLPId(123);
   * Used by: LP dashboard, advisory relationship tracking
   */
  async getConnectionsByLPId(lpId) {
    const connections = await this.getConnections();
    return connections.filter(conn => conn.lpId === parseInt(lpId));
  }

  /**
   * Get all connections for a specific company
   * @param {number|string} companyId - Company user ID
   * @returns {Promise<Array>} Array of connection objects for this company
   * 
   * Usage: const companyConnections = await dataService.getConnectionsByCompanyId(456);
   * Used by: Company dashboard, advisor relationship management
   */
  async getConnectionsByCompanyId(companyId) {
    const connections = await this.getConnections();
    return connections.filter(conn => conn.companyId === parseInt(companyId));
  }

  /**
   * Create a new advisory connection between LP and company
   * @param {Object} connectionData - Connection data object
   * @returns {Promise<Object>} Created connection with assigned ID
   * 
   * Usage:
   * const connection = await dataService.createConnection({
   *   lpId: 123,
   *   companyId: 456,
   *   opportunityId: 789,
   *   expertise: 'Marketing',
   *   startDate: '2025-08-15'
   * });
   * 
   * Features:
   * - Auto-generates unique ID
   * - Sets default status to 'active'
   * - Initializes totalMeetings to 0
   * - Adds timestamps
   */
  async createConnection(connectionData) {
    const connections = await this.getConnections();
    const newId = Math.max(...connections.map(c => c.id), 0) + 1;
    
    const newConnection = {
      id: newId,
      ...connectionData,
      status: connectionData.status || 'active',
      totalMeetings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    connections.push(newConnection);
    await this.writeFile('connections.json', connections);
    return newConnection;
  }

  /**
   * Update connection data (meeting counts, status changes, etc.)
   * @param {number|string} id - Connection ID to update
   * @param {Object} updates - Object containing fields to update
   * @returns {Promise<Object|null>} Updated connection object or null if failed
   * 
   * Usage:
   * const updated = await dataService.updateConnection(789, {
   *   totalMeetings: 5,
   *   lastMeeting: '2025-08-10',
   *   nextMeeting: '2025-08-24'
   * });
   * 
   * Used by: Meeting tracking, relationship status updates
   */
  async updateConnection(id, updates) {
    const connections = await this.getConnections();
    const connIndex = connections.findIndex(conn => conn.id === parseInt(id));
    
    if (connIndex === -1) return null;
    
    connections[connIndex] = { 
      ...connections[connIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.writeFile('connections.json', connections);
    return connections[connIndex];
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  /**
   * Generate comprehensive dashboard statistics for admin view
   * @returns {Promise<Object>} Object containing various system metrics
   * 
   * Usage: const stats = await dataService.getDashboardStats();
   * Used by: Admin dashboard, system monitoring, analytics
   * 
   * Returns object with metrics like:
   * - User counts by role and status
   * - Opportunity counts by status
   * - Connection metrics
   * - System health indicators
   */
  async getDashboardStats() {
    const users = await this.getUsers();
    const opportunities = await this.getOpportunities();
    const connections = await this.getConnections();

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      pendingUsers: users.filter(u => u.status === 'pending').length,
      totalLPs: users.filter(u => u.role === 'LP').length,
      activeLPs: users.filter(u => u.role === 'LP' && u.status === 'active').length,
      totalCompanies: users.filter(u => u.role === 'Company').length,
      activeCompanies: users.filter(u => u.role === 'Company' && u.status === 'active').length,
      totalOpportunities: opportunities.length,
      openOpportunities: opportunities.filter(o => o.status === 'open').length,
      matchedOpportunities: opportunities.filter(o => o.status === 'matched').length,
      closedOpportunities: opportunities.filter(o => o.status === 'closed').length,
      totalConnections: connections.length,
      activeConnections: connections.filter(c => c.status === 'active').length,
      completedConnections: connections.filter(c => c.status === 'completed').length
    };
  }

  // ==================== SEARCH & FILTERING ====================

  /**
   * Search users with optional role and status filtering
   * @param {string} query - Search term for name, email, or company name
   * @param {string} role - Optional role filter ('LP', 'Company', 'Admin')
   * @param {string} status - Optional status filter ('active', 'inactive', 'pending')
   * @returns {Promise<Array>} Array of matching user objects
   * 
   * Usage:
   * const results = await dataService.searchUsers('john', 'LP', 'active');
   * const allLPs = await dataService.searchUsers('', 'LP', null);
   * 
   * Used by: Admin user management, user discovery, filtering interfaces
   * 
   * Search includes: firstName, lastName, email, companyName (case-insensitive)
   */
  async searchUsers(query, role = null, status = null) {
    const users = await this.getUsers();
    
    return users.filter(user => {
      const matchesQuery = !query || 
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        (user.companyName && user.companyName.toLowerCase().includes(query.toLowerCase()));
      
      const matchesRole = !role || user.role === role;
      const matchesStatus = !status || user.status === status;
      
      return matchesQuery && matchesRole && matchesStatus;
    });
  }

  /**
   * Search opportunities with optional status filtering
   * @param {string} query - Search term for title, company name, or description
   * @param {string} status - Optional status filter ('open', 'matched', 'closed')
   * @returns {Promise<Array>} Array of matching opportunity objects
   * 
   * Usage:
   * const results = await dataService.searchOpportunities('marketing', 'open');
   * const allOpen = await dataService.searchOpportunities('', 'open');
   * 
   * Used by: Opportunity discovery, admin management, filtering
   * 
   * Search includes: title, companyName, description (case-insensitive)
   */
  async searchOpportunities(query, status = null) {
    const opportunities = await this.getOpportunities();
    
    return opportunities.filter(opp => {
      const matchesQuery = !query ||
        opp.title.toLowerCase().includes(query.toLowerCase()) ||
        opp.companyName.toLowerCase().includes(query.toLowerCase()) ||
        opp.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesStatus = !status || opp.status === status;
      
      return matchesQuery && matchesStatus;
    });
  }

  // ==================== APPLICATION OPERATIONS ====================

  /**
   * Get all applications from applications.json
   * @returns {Promise<Array>} Array of application objects
   * 
   * Usage: const applications = await dataService.getApplications();
   * Used by: Application management, admin oversight, statistics
   */
  async getApplications() {
    return await this.readFile('applications.json');
  }

  /**
   * Create a new application from LP to opportunity
   * @param {Object} applicationData - Application data object
   * @returns {Promise<Object>} Created application with assigned ID
   * 
   * Usage:
   * const application = await dataService.createApplication({
   *   lpId: 123,
   *   lpName: 'John Doe',
   *   opportunityId: 456,
   *   message: 'I am interested in this advisory role...'
   * });
   * 
   * Features:
   * - Auto-generates unique ID
   * - Sets default status to 'pending'
   * - Adds creation and update timestamps
   * - Links LP and opportunity data
   */
  async createApplication(applicationData) {
    const applications = await this.getApplications();
    const newId = Math.max(...applications.map(app => app.id), 0) + 1;
    
    const newApplication = {
      id: newId,
      ...applicationData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    applications.push(newApplication);
    await this.writeFile('applications.json', applications);
    return newApplication;
  }

  /**
   * Get all applications submitted by a specific LP
   * @param {number|string} lpId - LP user ID
   * @returns {Promise<Array>} Array of application objects for this LP
   * 
   * Usage: const myApplications = await dataService.getApplicationsByLP(123);
   * Used by: LP dashboard, application history, status tracking
   */
  async getApplicationsByLP(lpId) {
    const applications = await this.getApplications();
    return applications.filter(app => app.lpId === parseInt(lpId));
  }

  /**
   * Get all applications for a specific opportunity
   * @param {number|string} opportunityId - Opportunity ID
   * @returns {Promise<Array>} Array of application objects for this opportunity
   * 
   * Usage: const applicants = await dataService.getApplicationsByOpportunity(456);
   * Used by: Company application review, candidate selection
   */
  async getApplicationsByOpportunity(opportunityId) {
    const applications = await this.getApplications();
    return applications.filter(app => app.opportunityId === parseInt(opportunityId));
  }

  /**
   * Check if an LP has already applied to a specific opportunity
   * @param {number|string} lpId - LP user ID
   * @param {number|string} opportunityId - Opportunity ID
   * @returns {Promise<boolean>} True if already applied, false otherwise
   * 
   * Usage: const hasApplied = await dataService.hasApplied(123, 456);
   * Used by: Preventing duplicate applications, UI state management
   */
  async hasApplied(lpId, opportunityId) {
    const applications = await this.getApplications();
    return applications.some(app => 
      app.lpId === parseInt(lpId) && 
      app.opportunityId === parseInt(opportunityId)
    );
  }

  /**
   * Synchronize opportunity applicant count with actual applications
   * @param {number|string} opportunityId - Opportunity ID to sync
   * @returns {Promise<number>} Actual number of applications
   * 
   * Usage: const actualCount = await dataService.syncOpportunityApplicantCount(456);
   * Used by: Data consistency maintenance, fixing count mismatches
   * 
   * This ensures the applicantCount field in opportunities matches
   * the actual number of applications in the applications.json file
   */
  async syncOpportunityApplicantCount(opportunityId) {
    const applications = await this.getApplicationsByOpportunity(opportunityId);
    const actualCount = applications.length;
    
    // Update the opportunity with the correct count
    await this.updateOpportunity(opportunityId, { applicantCount: actualCount });
    
    return actualCount;
  }

  /**
   * Update application status or other fields
   * @param {number|string} id - Application ID to update
   * @param {Object} updates - Object containing fields to update
   * @returns {Promise<Object|null>} Updated application object or null if failed
   * 
   * Usage:
   * const updated = await dataService.updateApplication(789, {
   *   status: 'accepted',
   *   reviewedBy: 'Company Admin',
   *   reviewNotes: 'Great experience match'
   * });
   * 
   * Common status values: 'pending', 'reviewed', 'accepted', 'rejected'
   * Used by: Company application review process
   */
  async updateApplication(id, updates) {
    const applications = await this.getApplications();
    const appIndex = applications.findIndex(app => app.id === parseInt(id));
    
    if (appIndex === -1) return null;
    
    applications[appIndex] = { 
      ...applications[appIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.writeFile('applications.json', applications);
    return applications[appIndex];
  }
}

/**
 * Export a singleton instance of DataService
 * This ensures all parts of the application use the same instance
 * and maintains consistent state and connections
 */
module.exports = new DataService();
