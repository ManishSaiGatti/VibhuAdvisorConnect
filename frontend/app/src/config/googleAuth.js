/**
 * Google OAuth Configuration
 * 
 * Configuration file for Google OAuth 2.0 authentication setup.
 * Contains client credentials and redirect URIs for Google Sign-In.
 */

export const GOOGLE_AUTH_CONFIG = {
  // Replace with your actual Google OAuth Client ID from Google Cloud Console
  clientId: 'Client ID',
  
  // Redirect URI after successful Google authentication
  redirectUri: 'http://localhost:5173/auth/google/callback',
  
  // OAuth scopes required for authentication
  scope: 'email profile',
  
  // Response type for OAuth flow
  responseType: 'code',
  
  // Access type for refresh tokens
  accessType: 'online'
};

// Note: Replace 'YOUR_GOOGLE_CLIENT_ID_HERE' with your actual Google OAuth Client ID
// You can find this in your Google Cloud Console under APIs & Services > Credentials
