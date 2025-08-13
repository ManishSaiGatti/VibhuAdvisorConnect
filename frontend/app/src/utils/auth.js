/**
 * @fileoverview Authentication utility functions for session management.
 * 
 * This module provides a centralized interface for managing user authentication
 * data in the browser's session storage. It handles token storage, user data
 * persistence, and authentication state verification.
 * 
 * Session Storage vs Local Storage:
 * - Uses sessionStorage for security (data cleared when tab closes)
 * - Prevents persistent login across browser sessions
 * - Reduces security risk if user leaves browser open
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

/**
 * Retrieves the authentication token from session storage.
 * 
 * Used throughout the application to authenticate API requests.
 * Returns null if no token is stored or if session has expired.
 * 
 * @returns {string|null} JWT authentication token or null if not found
 * 
 * Usage Example:
 * ```javascript
 * const token = getToken();
 * if (token) {
 *   // Make authenticated API request
 *   headers: { Authorization: `Bearer ${token}` }
 * }
 * ```
 */
export const getToken = () => sessionStorage.getItem('token');

/**
 * Retrieves and parses user data from session storage.
 * 
 * Returns the complete user object including role, email, profile data, etc.
 * Automatically handles JSON parsing and error cases.
 * 
 * @returns {Object|null} User data object or null if not found/invalid
 * @returns {string} returns.role - User role (Admin, LP, Company)
 * @returns {string} returns.email - User email address
 * @returns {string} returns.id - Unique user identifier
 * 
 * Usage Example:
 * ```javascript
 * const user = getUserData();
 * if (user && user.role === 'Company') {
 *   // Show company-specific features
 * }
 * ```
 */
export const getUserData = () => {
  const userData = sessionStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Stores authentication data in session storage.
 * 
 * Called after successful login to persist user session.
 * Stores both JWT token and complete user data object.
 * 
 * @param {string} token - JWT authentication token
 * @param {Object} user - Complete user data object
 * @param {string} user.role - User role (Admin, LP, Company)
 * @param {string} user.email - User email address
 * @param {string} user.id - Unique user identifier
 * 
 * Usage Example:
 * ```javascript
 * // In login success handler
 * setAuthData(response.data.token, response.data.user);
 * ```
 */
export const setAuthData = (token, user) => {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
};

/**
 * Clears all authentication data from session storage.
 * 
 * Used during logout to ensure complete session termination.
 * Removes both token and user data to prevent unauthorized access.
 * 
 * Usage Example:
 * ```javascript
 * // In logout handler
 * clearAuthData();
 * setUser(null);
 * setIsAuthenticated(false);
 * ```
 */
export const clearAuthData = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

/**
 * Checks if user is currently authenticated.
 * 
 * Verifies that both token and user data exist in session storage.
 * Useful for route guards and conditional rendering.
 * 
 * @returns {boolean} True if user is authenticated, false otherwise
 * 
 * Usage Example:
 * ```javascript
 * if (isAuthenticated()) {
 *   // Render protected content
 * } else {
 *   // Redirect to login
 * }
 * ```
 */
export const isAuthenticated = () => {
  const token = getToken();
  const user = getUserData();
  return !!(token && user);
};
