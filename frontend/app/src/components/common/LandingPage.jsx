/**
 * @fileoverview Landing page component for Vibhu Advisor Connect.
 * 
 * This component serves as the main entry point for unauthenticated users
 * visiting the Vibhu Advisor Connect platform. It provides an overview
 * of the platform's purpose and a call-to-action for user login.
 * 
 * The landing page presents:
 * - Platform branding and title
 * - Value proposition and description
 * - Login access point for existing users
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onLoginClick - Callback function triggered when login button is clicked
 * 
 * @example
 * ```jsx
 * <LandingPage onLoginClick={() => setCurrentView('login')} />
 * ```
 * 
 * @author Vibhu Advisor Connect Team
 * @version 1.0.0
 */

import '../../styles/components/LandingPage.css';

/**
 * Landing page component that introduces the platform and provides login access.
 * 
 * This component is displayed to unauthenticated users and serves as the
 * main entry point to the platform. It includes branding, value proposition,
 * and a prominent login button.
 * 
 * Features:
 * - Clean, professional design reflecting the platform's purpose
 * - Clear value proposition for both startups and advisors
 * - Single call-to-action to guide users to login
 * - Responsive design for various screen sizes
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onLoginClick - Handler function called when user clicks login button
 * @returns {JSX.Element} Rendered landing page component
 */
function LandingPage({ onLoginClick }) {
  return (
    <div className="landing-container">
      <div className="landing-content">
        {/* Platform title and branding */}
        <h1 className="landing-title">Vibhu Advisor Connect</h1>
        
        {/* Main value proposition */}
        <p className="landing-subtitle">
          Connect Early-Stage Startups with Expert Advisors
        </p>
        
        {/* Detailed platform description */}
        <p className="landing-description">
          Our exclusive platform bridges the gap between promising startups and our network of Limited Partners, 
          creating meaningful advisory relationships that drive success.
        </p>
        
        {/* Primary call-to-action button */}
        <button 
          className="landing-button"
          onClick={onLoginClick}
        >
          Login to Platform
        </button>
      </div>
    </div>
  );
}

export default LandingPage;