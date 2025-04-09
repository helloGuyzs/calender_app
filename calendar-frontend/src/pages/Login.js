import React from 'react';
import './Login.css';

const Login = () => {
  const handleLogin = () => {
    window.location.href = "https://a9c6-106-216-252-199.ngrok-free.app/google-login";
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to Calendar App</h1>
          <p>Manage your events with ease</p>
        </div>
        
        <button className="google-login-button" onClick={handleLogin}>
          <img 
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google Logo" 
            className="google-icon"
          />
          Sign in with Google
        </button>
        
        <div className="login-footer">
          <p>Securely manage your calendar events</p>
          <small>© 2025 Calendar App. All rights reserved.</small>
        </div>
      </div>
    </div>
  );
};

export default Login;