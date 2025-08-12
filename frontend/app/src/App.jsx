import { useState, useEffect } from 'react';
import { 
  LandingPage, 
  LoginComponent, 
  LPDashboard, 
  CompanyDashboard,
  AdminDashboard,
  PostOpportunity 
} from './components';
import { getToken, getUserData, clearAuthData } from './utils';
import './styles/App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = getToken();
    const userData = getUserData();
    
    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    }
  }, []);

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handlePostOpportunity = () => {
    setEditingOpportunity(null); // Clear any editing state
    setCurrentView('postOpportunity');
  };

  const handleEditOpportunity = (opportunity) => {
    setEditingOpportunity(opportunity);
    setCurrentView('postOpportunity');
  };

  const handleBackToDashboard = () => {
    setEditingOpportunity(null); // Clear editing state when going back
    setCurrentView('dashboard');
  };

  const handleOpportunitySuccess = () => {
    setEditingOpportunity(null); // Clear editing state after success
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    // Clear tokens and user data
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('landing');
    console.log('User logged out, data cleared');
  };

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'Admin':
        return <AdminDashboard onLogout={handleLogout} />;
      case 'LP':
        return <LPDashboard onLogout={handleLogout} />;
      case 'Company':
        return <CompanyDashboard 
          onLogout={handleLogout} 
          onPostOpportunity={handlePostOpportunity}
          onEditOpportunity={handleEditOpportunity}
        />;
      default:
        return <div>Unknown user role</div>;
    }
  };

  console.log('Current view:', currentView);
  console.log('Is authenticated:', isAuthenticated);
  console.log('User:', user);

  if (currentView === 'login') {
    return (
      <LoginComponent 
        onLogin={handleLoginSuccess}
        onBack={handleBackToLanding}
      />
    );
  }

  if (currentView === 'postOpportunity' && isAuthenticated && user?.role === 'Company') {
    return (
      <PostOpportunity 
        onBack={handleBackToDashboard}
        onSuccess={handleOpportunitySuccess}
        editingOpportunity={editingOpportunity}
      />
    );
  }

  if (currentView === 'dashboard' && isAuthenticated && user) {
    return renderDashboard();
  }

  return <LandingPage onLoginClick={handleLoginClick} />;
}

export default App;