import React from 'react';
import { useNavigate } from 'react-router-dom';
import EventList from '../components/EventList';
import CreateEventForm from '../components/CreateEventForm';
import axios from '../api/axios';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/logout/');  // Add this endpoint in backend
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Calendar Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      
      <div className="dashboard-content">
        <CreateEventForm onEventCreated={() => window.location.reload()}/>
        <EventList />
      </div>
    </div>
  );
}

export default Dashboard;