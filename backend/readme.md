# VibhuAdvisorConnect Backend

A comprehensive REST API backend for connecting Limited Partners (LPs) with portfolio companies for advisory relationships.

## 🏗️ Architecture Overview

VibhuAdvisorConnect is built with a clean, modular architecture that supports three distinct user roles and provides a complete advisory matching platform.

### System Components

```
├── server.js              # Application entry point and route registration
├── controllers/            # Business logic and request handling
│   ├── adminController.js     # System administration
│   ├── authController.js      # Authentication & role-based dashboards
│   ├── companyController.js   # Company profile management
│   ├── lpController.js        # LP profile and opportunity browsing
│   └── opportunitiesController.js # Core opportunity lifecycle
├── middleware/             # Request processing middleware
│   ├── authMiddleware.js      # JWT token verification
│   └── roleMiddleware.js      # Role-based access control
├── routes/                 # API endpoint definitions
│   ├── authRoutes.js          # Authentication endpoints
│   ├── adminRoutes.js         # Admin management endpoints
│   ├── companyRoutes.js       # Company-specific endpoints
│   ├── lpRoutes.js            # LP-specific endpoints
│   ├── opportunitiesRoutes.js # Opportunity management
│   └── applicationsRoutes.js  # Application processing
├── services/               # Data access and business services
│   └── dataService.js         # Centralized data management
└── data/                   # JSON-based data storage
    ├── users.json             # User accounts and profiles
    ├── opportunities.json     # Advisory opportunities
    ├── connections.json       # Active advisory relationships
    └── applications.json      # LP applications to opportunities
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ManishSaiGatti/VibhuAdvisorConnect.git
   cd VibhuAdvisorConnect/App/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create .env file
   echo "JWT_SECRET=your-secret-key-here" > .env
   echo "PORT=5000" >> .env
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000/api`

## 🔐 Authentication & Authorization

### JWT Token-Based Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Admin**: Full system access, user management, analytics
- **LP**: Advisory opportunity browsing, application submission, profile management
- **Company**: Opportunity posting, application review, profile management

### Role-Based Access Control
Routes are protected using middleware that enforces role requirements:
```javascript
// Example: Admin-only route
router.get('/admin-data', authMiddleware, requireRole('Admin'), handler);

// Example: LP or Company route
router.get('/profile', authMiddleware, requireRole('LP', 'Company'), handler);
```

## 📚 API Documentation

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/login` | User authentication | Public |
| GET | `/protected` | Token verification | Authenticated |
| GET | `/dashboard` | Role-based dashboard redirect | Authenticated |
| GET | `/dashboard/admin` | Admin dashboard data | Admin |
| GET | `/dashboard/lp` | LP dashboard data | LP |
| GET | `/dashboard/company` | Company dashboard data | Company |

### Admin Management (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/stats` | System statistics | Admin |
| GET | `/users` | All users | Admin |
| GET | `/users/search` | User search & filtering | Admin |
| PATCH | `/users/:id/status` | Update user status | Admin |
| GET | `/opportunities` | All opportunities | Admin |
| POST | `/opportunities` | Create opportunity | Admin |
| PATCH | `/opportunities/:id/status` | Update opportunity status | Admin |
| DELETE | `/opportunities/:id` | Delete opportunity | Admin |

### Opportunity Management (`/api/opportunities`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Browse opportunities (filtered) | Authenticated |
| POST | `/` | Create new opportunity | Company |
| GET | `/:id` | Get opportunity details | Authenticated |
| PUT | `/:id` | Update opportunity | Company (owner) |
| PATCH | `/:id` | Partial opportunity update | Company (owner) |
| DELETE | `/:id` | Delete opportunity | Company (owner) |
| POST | `/:id/view` | Track opportunity view | Authenticated |
| POST | `/:id/apply` | Apply to opportunity | LP |

### Company Features (`/api/company`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/profile` | Get company profile | Company |
| PUT | `/profile` | Update company profile | Company |
| GET | `/opportunities` | Get company's opportunities | Company |

### LP Features (`/api/lp`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/profile` | Get LP profile | LP |
| PUT | `/profile` | Update LP profile | LP |
| GET | `/opportunities` | Browse opportunities (with matching) | LP |
| GET | `/dashboard` | LP dashboard data | LP |

## 🔧 Core Features

### Opportunity Lifecycle Management
- **Creation**: Companies post advisory opportunities with expertise requirements
- **Discovery**: LPs browse opportunities with match scoring based on expertise
- **Application**: LPs apply to relevant opportunities
- **Review**: Companies review applications and update status
- **Tracking**: Real-time metrics and view tracking

### Advanced Filtering & Search
- **Multi-parameter filtering**: Status, expertise, time commitment, search terms
- **Role-based views**: Different data for different user types
- **Real-time search**: Instant filtering across multiple fields
- **Match scoring**: Algorithm-based relevance scoring for LPs

### Data Consistency & Analytics
- **Automatic sync**: Real-time applicant count synchronization
- **View tracking**: Opportunity engagement analytics
- **Dashboard metrics**: Role-specific KPIs and insights
- **Impact measurement**: Advisory relationship success tracking

## 📊 Data Models

### User Schema
```javascript
{
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: 'Admin' | 'LP' | 'Company',
  status: 'active' | 'inactive' | 'pending',
  // LP-specific fields
  expertise?: string[],
  headline?: string,
  bio?: string,
  linkedIn?: string,
  availableHours?: string,
  // Company-specific fields
  companyName?: string,
  website?: string,
  description?: string,
  stage?: string,
  industry?: string,
  // Timestamps
  joinedDate: string,
  createdAt: string,
  updatedAt: string
}
```

### Opportunity Schema
```javascript
{
  id: number,
  title: string,
  description: string,
  requiredExpertise: string[],
  timeCommitment: string,
  compensation: string,
  companyId: number,
  companyName: string,
  status: 'open' | 'matched' | 'closed',
  viewCount: number,
  applicantCount: number,
  priority: 'low' | 'medium' | 'high',
  createdAt: string,
  updatedAt: string
}
```

### Application Schema
```javascript
{
  id: number,
  lpId: number,
  lpName: string,
  lpEmail: string,
  opportunityId: number,
  opportunityTitle: string,
  companyId: number,
  companyName: string,
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected',
  message?: string,
  createdAt: string,
  updatedAt: string
}
```

## 🛡️ Security Features

### Authentication Security
- JWT tokens with configurable expiration
- Secure password validation (consider bcrypt for production)
- Protected route middleware with proper error handling

### Authorization Control
- Role-based access control (RBAC)
- Resource ownership validation
- Multi-role endpoint support

### Data Protection
- Password exclusion from API responses
- Input validation and sanitization
- SQL injection prevention (though using JSON storage)

## 🔄 Development Workflow

### Code Organization
- **Separation of Concerns**: Clear separation between routes, controllers, and services
- **Middleware Pattern**: Reusable authentication and authorization middleware
- **Error Handling**: Consistent error responses across all endpoints
- **Logging**: Debug logging for troubleshooting and monitoring

### API Design Principles
- **RESTful Architecture**: Standard HTTP methods and status codes
- **Consistent Response Format**: Standardized JSON responses
- **Versioning Ready**: Structured for future API versioning
- **Documentation**: Comprehensive inline documentation

## 🚀 Production Considerations

### Performance Optimizations
- Implement database connection pooling
- Add response caching for frequently accessed data
- Implement pagination for large data sets
- Add compression middleware

### Security Enhancements
- Replace plain text passwords with bcrypt hashing
- Implement rate limiting
- Add HTTPS enforcement
- Implement CORS properly for production domains
- Add input validation with libraries like Joi

### Monitoring & Logging
- Implement structured logging with Winston
- Add health check endpoints
- Implement error tracking (e.g., Sentry)
- Add performance monitoring

### Database Migration
- Plan migration from JSON files to proper database (PostgreSQL/MongoDB)
- Implement database migrations and seeders
- Add data backup and recovery procedures

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Follow the existing code patterns and documentation standards
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- Follow existing naming conventions
- Add comprehensive JSDoc comments
- Include error handling in all functions
- Write meaningful commit messages

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For questions or support, please contact the VibhuAdvisorConnect development team.

---

**Built with ❤️ for connecting expertise with opportunity**