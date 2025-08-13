/**
 * @fileoverview Application entry point for Vibhu Advisor Connect.
 * 
 * This is the main entry file that initializes the React application
 * and mounts it to the DOM. It sets up the root component and applies
 * React's StrictMode for development debugging.
 * 
 * StrictMode Benefits:
 * - Identifies components with unsafe lifecycles
 * - Warns about legacy string ref API usage
 * - Warns about deprecated findDOMNode usage
 * - Detects unexpected side effects
 * - Helps ensure components are resilient to future React versions
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Initialize and render the React application.
 * 
 * Creates the React root element and renders the main App component
 * wrapped in StrictMode for enhanced development experience and
 * future React compatibility.
 * 
 * The application mounts to the 'root' element defined in index.html.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)