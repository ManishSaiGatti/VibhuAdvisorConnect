import '../../styles/components/LandingPage.css';

function LandingPage({ onLoginClick }) {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Vibhu Advisor Connect</h1>
        
        <p className="landing-subtitle">
          Connect Early-Stage Startups with Expert Advisors
        </p>
        
        <p className="landing-description">
          Our exclusive platform bridges the gap between promising startups and our network of Limited Partners, 
          creating meaningful advisory relationships that drive success.
        </p>
        
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