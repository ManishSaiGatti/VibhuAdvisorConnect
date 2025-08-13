/**
 * @fileoverview Utility functions barrel export.
 * 
 * This module serves as a centralized export point for all utility functions
 * used throughout the Vibhu Advisor Connect application. It provides a clean
 * import interface for other modules.
 * 
 * Available Utilities:
 * - Authentication utilities (auth.js): Session management, token handling
 * - Class name utilities (cn.js): Tailwind CSS class optimization
 * 
 * Usage Example:
 * ```javascript
 * import { getToken, getUserData, clearAuthData } from './utils';
 * import { cn } from './utils/cn';
 * ```
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

// Authentication utilities - Session and token management
export * from './auth.js';

// Note: cn utility is imported separately due to different usage patterns
// Import directly: import { cn } from './utils/cn';
