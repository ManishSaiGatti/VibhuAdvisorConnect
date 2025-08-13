# Vibhu Advisor Connect - Frontend Application

A professional React-based web application for connecting early-stage startups with expert advisors. Built with modern web technologies and designed for scalability and maintainability.

## 🎯 Project Overview

Vibhu Advisor Connect is an exclusive platform that bridges the gap between promising startups and a network of Limited Partners (LPs), creating meaningful advisory relationships that drive business success. The application supports three distinct user roles with tailored experiences:

- **Admin**: Platform administration, user management, and system oversight
- **Limited Partners (LPs)**: Advisory services, portfolio review, and expert matching
- **Companies**: Opportunity posting, advisor search, and profile management

## 🚀 Technology Stack

- **Framework**: React 19.1.0 with hooks-based architecture
- **Build Tool**: Vite 7.0.4 for fast development and optimized builds
- **Styling**: CSS3 with modular component-specific stylesheets
- **UI Components**: Chakra UI, Radix UI primitives
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios for API communication
- **Authentication**: JWT token-based with session storage
- **Icons**: Lucide React, React Icons
- **Utilities**: Class variance authority, Tailwind Merge, clsx

## 📁 Project Structure

```
src/
├── components/           # React components organized by feature
│   ├── auth/            # Authentication components
│   │   ├── LoginComponent.jsx      # Main login form
│   │   ├── ProtectedComponent.jsx  # Route protection
│   │   └── index.js                # Barrel exports
│   ├── common/          # Shared components
│   │   ├── LandingPage.jsx         # Application entry point
│   │   └── index.js
│   ├── dashboards/      # Role-based dashboard components
│   │   ├── AdminDashboard.jsx      # Platform administration
│   │   ├── LPDashboard.jsx         # Limited Partner interface
│   │   ├── CompanyDashboard.jsx    # Company management
│   │   └── index.js
│   ├── opportunities/   # Opportunity management
│   │   ├── PostOpportunity.jsx     # Create/edit opportunities
│   │   ├── OpportunitiesPage.jsx   # Company opportunity view
│   │   ├── LPOpportunitiesPage.jsx # LP opportunity browser
│   │   └── index.js
│   └── index.js         # Main component exports
├── styles/              # CSS stylesheets
│   ├── components/      # Component-specific styles
│   ├── dashboards/      # Dashboard-specific styles
│   ├── opportunities/   # Opportunity-related styles
│   └── App.css          # Global application styles
├── utils/               # Utility functions
│   ├── auth.js          # Authentication utilities
│   ├── cn.js            # Class name utilities
│   └── index.js         # Utility exports
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
└── index.css            # Global CSS imports
```

## 🔧 Key Features

### Authentication & Security
- JWT token-based authentication
- Session storage for security (clears on browser close)
- Role-based access control
- Protected routes and API endpoints
- Secure logout with complete session cleanup

### User Roles & Permissions
- **Admin Dashboard**: User management, opportunity oversight, system analytics
- **LP Dashboard**: Portfolio management, advisory opportunities, expert matching
- **Company Dashboard**: Opportunity posting, advisor search, profile management

### User Experience
- Responsive design for desktop and mobile
- Loading states and error handling
- Intuitive navigation and clean UI
- Form validation and user feedback
- Professional styling and branding

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run lint     # Run ESLint for code quality
npm run preview  # Preview production build locally
```

## 🔐 Authentication Flow

1. **Landing Page**: Unauthenticated users see the main landing page
2. **Login**: Users authenticate with email/password
3. **Token Storage**: JWT token and user data stored in session storage
4. **Role-Based Routing**: Users redirected to appropriate dashboard
5. **Session Persistence**: Authentication persists across browser refreshes
6. **Secure Logout**: Complete session cleanup on logout

### Demo Credentials
```
Admin:   admin@example.com / admin123
LP:      lp@example.com / lp123
Company: company@example.com / company123
```

## 📡 API Integration

The frontend communicates with a backend API using Axios:
- Base URL: `http://localhost:3000/api`
- Authentication: Bearer token in headers
- Endpoints for auth, user management, opportunities, and dashboards

## 🎨 Styling Architecture

- **Modular CSS**: Component-specific stylesheets
- **Responsive Design**: Mobile-first approach
- **Design System**: Consistent colors, typography, and spacing
- **Utility Classes**: Tailwind CSS integration with intelligent merging

## 📱 Component Architecture

### App.jsx (Root Component)
- Manages global application state
- Handles routing and navigation
- Orchestrates authentication flow
- Renders appropriate components based on state

### Authentication Components
- `LoginComponent`: Comprehensive login form with validation
- `ProtectedComponent`: Route guard for authenticated content

### Dashboard Components
- Role-specific dashboards with tailored functionality
- Data fetching and state management
- Tabbed interfaces for organized navigation

### Utility Functions
- `auth.js`: Session management and token handling
- `cn.js`: Tailwind CSS class optimization

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Configuration
- Development: `npm run dev` (localhost:5173)
- Production: Optimized build with minification and bundling

## 🤝 Contributing

1. Follow the established code structure and naming conventions
2. Add comprehensive JSDoc documentation for new components
3. Include prop validation and type checking
4. Write component-specific CSS in the appropriate style directories
5. Test authentication flows and role-based access
6. Ensure responsive design compatibility

## 📄 License

This project is part of the Vibhu Advisor Connect internship program.

---

**Built with ❤️ by the Vibhu Advisor Connect Team**
