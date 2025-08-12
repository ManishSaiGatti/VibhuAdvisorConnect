import { useState } from 'react';
import axios from 'axios';
import { setAuthData } from '../../utils';
import '../../styles/components/LoginComponent.css';

function Login({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      // Store both token and user data
      setAuthData(res.data.token, res.data.user);
      onLogin(res.data.user); // Pass user data to parent
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Header */}
      <header className="login-header">
        <div className="login-header-content">
          {onBack && (
            <button className="back-button" onClick={onBack}>
              ← Back to Home
            </button>
          )}
          <h1 className="login-header-title">Vibhu Advisor Connect</h1>
        </div>
      </header>

      {/* Login Form */}
      <div className="login-form-container">
        <div className="login-card">
          <div className="login-form-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">
              Sign in to access the Vibhu Advisor Connect platform
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <div className="demo-info">
            <p className="demo-title">Demo Access:</p>
            <p className="demo-text">
              <strong>Admin:</strong> admin@example.com / admin123<br/>
              <strong>LP:</strong> lp@example.com / lp123<br/>
              <strong>Company:</strong> company@example.com / company123
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="login-footer-text">
            This is an invite-only platform. Contact support if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
