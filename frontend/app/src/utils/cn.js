/**
 * @fileoverview Class name utility function for Tailwind CSS optimization.
 * 
 * This module provides a utility function for intelligently merging and
 * deduplicating CSS class names, particularly useful with Tailwind CSS
 * where class conflicts can occur.
 * 
 * Uses two powerful libraries:
 * - clsx: Conditionally applies classes based on various input types
 * - tailwind-merge: Intelligently merges Tailwind classes, removing conflicts
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and optimizes CSS class names with Tailwind CSS conflict resolution.
 * 
 * This function combines the power of clsx for conditional class application
 * and tailwind-merge for intelligent Tailwind CSS class deduplication.
 * 
 * Key Features:
 * - Handles conditional classes (objects, arrays, strings)
 * - Resolves Tailwind CSS class conflicts (later classes override earlier ones)
 * - Removes duplicate classes
 * - Optimizes final class string
 * 
 * @param {...any} inputs - Variable number of class inputs (strings, objects, arrays)
 * @returns {string} Optimized, deduplicated class string
 * 
 * Usage Examples:
 * ```javascript
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500')
 * // Returns: "px-4 py-2 bg-blue-500"
 * 
 * // Conditional classes
 * cn('base-class', { 'active-class': isActive, 'disabled-class': isDisabled })
 * 
 * // Tailwind conflict resolution
 * cn('px-2 px-4', 'py-1 py-2')
 * // Returns: "px-4 py-2" (conflicts resolved)
 * 
 * // Array syntax
 * cn(['base-class', isActive && 'active-class'])
 * 
 * // Complex example
 * cn(
 *   'btn btn-base',
 *   {
 *     'btn-primary': variant === 'primary',
 *     'btn-secondary': variant === 'secondary',
 *     'btn-disabled': disabled
 *   },
 *   'px-2 px-4', // px-4 will override px-2
 *   className // Additional classes from props
 * )
 * ```
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
