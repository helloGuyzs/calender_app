import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import './EventList.css';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add this for forcing refresh

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/events/');
      console.log('Events response:', response.data);
      setEvents(response.data.response.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh events when refreshKey changes
  useEffect(() => {
    fetchEvents();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1); // This will trigger the useEffect
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      console.log('Deleting event:', eventId);
      const response = await axios.delete(`/delete-event/${eventId}/`);
      console.log('Delete response:', response);
      
      if (response.data.status === 'Success') {
        // Refresh the events list after successful deletion
        handleRefresh();
      } else {
        setError('Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    }
  };

  const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) return <div className="events-loading">Loading events...</div>;
  if (error) return <div className="events-error">Error: {error}</div>;
  if (!events.length) return <div className="events-empty">No events found</div>;

  return (
    <div className="events-list">
      <div className="events-header">
        <h2>Your Events</h2>
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh Events
        </button>
      </div>
      {events.map((event) => (
        <div key={event.id} className="event-card">
          <div className="event-header">
            <h3>{event.summary}</h3>
            <button 
              className="delete-button"
              onClick={() => handleDeleteEvent(event.id)}
            >
              Delete
            </button>
          </div>
          
          {event.description && (
            <p className="event-description">{event.description}</p>
          )}
          
          <div className="event-time">
            <div>
              <strong>Start:</strong> {formatDateTime(event.start)}
            </div>
            <div>
              <strong>End:</strong> {formatDateTime(event.end)}
            </div>
          </div>

          {event.attendees && event.attendees.length > 0 && (
            <div className="event-attendees">
              <strong>Attendees:</strong>
              <ul>
                {event.attendees.map((email, index) => (
                  <li key={index}>{email}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="event-links">
            {event.meet_link && (
              <a 
                href={event.meet_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="meet-link"
              >
                Join Meet
              </a>
            )}
            {event.event_link && (
              <a 
                href={event.event_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="calendar-link"
              >
                View in Calendar
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventList;