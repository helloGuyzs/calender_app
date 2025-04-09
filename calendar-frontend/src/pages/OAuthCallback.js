import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Current cookies:', document.cookie);
        const res = await axios.get('/api/check-calendar-connection/');
        console.log('Auth check response:', res.data);
        
        if (res.data?.response?.isConnected) {
          navigate('/dashboard');
        } else {
          console.error('Not connected despite having session');
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/login');
      }
    };
  
    checkAuth();
  }, [navigate]);

  return <div>Verifying authentication...</div>;
}

export default OAuthCallback;
