const fs = require('fs').promises;
const path = require('path');

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

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

  // User operations
  async getUsers() {
    return await this.readFile('users.json');
  }

  async getUserById(id) {
    const users = await this.getUsers();
    return users.find(user => user.id === parseInt(id));
  }

  async getUserByEmail(email) {
    const users = await this.getUsers();
    return users.find(user => user.email === email);
  }

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

  async deleteUser(id) {
    const users = await this.getUsers();
    const filteredUsers = users.filter(user => user.id !== parseInt(id));
    
    if (filteredUsers.length === users.length) return false;
    
    await this.writeFile('users.json', filteredUsers);
    return true;
  }

  // Opportunity operations
  async getOpportunities() {
    return await this.readFile('opportunities.json');
  }

  async getOpportunityById(id) {
    const opportunities = await this.getOpportunities();
    return opportunities.find(opp => opp.id === parseInt(id));
  }

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

  async deleteOpportunity(id) {
    const opportunities = await this.getOpportunities();
    const filteredOpportunities = opportunities.filter(opp => opp.id !== parseInt(id));
    
    if (filteredOpportunities.length === opportunities.length) return false;
    
    await this.writeFile('opportunities.json', filteredOpportunities);
    return true;
  }

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

  // Connection operations
  async getConnections() {
    return await this.readFile('connections.json');
  }

  async getConnectionById(id) {
    const connections = await this.getConnections();
    return connections.find(conn => conn.id === parseInt(id));
  }

  async getConnectionsByLPId(lpId) {
    const connections = await this.getConnections();
    return connections.filter(conn => conn.lpId === parseInt(lpId));
  }

  async getConnectionsByCompanyId(companyId) {
    const connections = await this.getConnections();
    return connections.filter(conn => conn.companyId === parseInt(companyId));
  }

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

  // Dashboard statistics
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

  // Search and filter operations
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

  // Application operations
  async getApplications() {
    return await this.readFile('applications.json');
  }

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

  async getApplicationsByLP(lpId) {
    const applications = await this.getApplications();
    return applications.filter(app => app.lpId === parseInt(lpId));
  }

  async getApplicationsByOpportunity(opportunityId) {
    const applications = await this.getApplications();
    return applications.filter(app => app.opportunityId === parseInt(opportunityId));
  }

  async hasApplied(lpId, opportunityId) {
    const applications = await this.getApplications();
    return applications.some(app => 
      app.lpId === parseInt(lpId) && 
      app.opportunityId === parseInt(opportunityId)
    );
  }

  // Sync applicant count for an opportunity with actual applications
  async syncOpportunityApplicantCount(opportunityId) {
    const applications = await this.getApplicationsByOpportunity(opportunityId);
    const actualCount = applications.length;
    
    // Update the opportunity with the correct count
    await this.updateOpportunity(opportunityId, { applicantCount: actualCount });
    
    return actualCount;
  }

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

module.exports = new DataService();
