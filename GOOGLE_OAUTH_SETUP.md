# Google OAuth Setup Instructions

## Configuration Required

To complete the Google OAuth integration, you need to update two configuration files with your actual Google OAuth credentials:

### 1. Frontend Configuration
File: `frontend/app/src/config/googleAuth.js`

Replace `'YOUR_GOOGLE_CLIENT_ID_HERE'` with your actual Google OAuth Client ID.

```javascript
export const GOOGLE_AUTH_CONFIG = {
  clientId: 'YOUR_ACTUAL_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE',
  // ... rest remains the same
};
```

### 2. Backend Configuration
File: `backend/.env`

Replace the placeholder values with your actual Google OAuth credentials:

```
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_FROM_GOOGLE_CLOUD_CONSOLE
```

## How to Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID
5. Copy the Client ID and Client Secret

## Current OAuth Settings

Based on your setup:
- **Authorized JavaScript Origins**: `http://localhost:5173`
- **Authorized Redirect URIs**: `http://localhost:5173/auth/google/callback`

These should match what you configured in the Google Cloud Console.

## Testing the Setup

Once you've added the credentials:

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend/app && npm run dev`
3. Visit `http://localhost:5173`
4. Click "Login to Platform"
5. Try signing in with Google

## Features Implemented

✅ Google Sign-In button replaces traditional login form
✅ New user account setup flow (choose LP or Company)
✅ Profile setup with role-specific fields
✅ JWT token generation and storage
✅ Dashboard routing based on user role
✅ Google user data integration
✅ Existing user recognition and auto-login

## New User Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User authorizes the application
4. If new user → Account Setup page appears
5. User chooses account type (LP or Company) and fills profile
6. User is redirected to appropriate dashboard

## Returning User Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User authorizes the application
4. User is immediately redirected to their dashboard
