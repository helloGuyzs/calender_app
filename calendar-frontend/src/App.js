import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import axios from './api/axios';      
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';

function AppRouter() {
  const [isConnected, setIsConnected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await axios.get('/api/check-calendar-connection/');
        console.log('API Response:', res.data);
        if (res.data?.response?.isConnected) {
          setIsConnected(true);
          navigate('/dashboard');
        } else {
          setIsConnected(false);
          navigate('/login');
        }
      } catch (err) {
        console.error('Error checking connection:', err);
        navigate('/login');
      }
    };

    checkConnection();
  }, [navigate]);

  return (
    <>
      {isConnected === null ? (
        <div>Loading...</div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      )}
    </>
  );
}

export default AppRouter;