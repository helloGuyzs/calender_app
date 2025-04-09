import React, { useState } from 'react';
import axios from '../api/axios';
import './CreateEventForm.css';

function CreateEventForm({ onEventCreated }) {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    start: '',
    end: '',
    attendees: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const attendeesArray = formData.attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      // Format datetime to match the working curl request format
      const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().replace('Z', '+05:30');
      };

      const eventData = {
        summary: formData.summary,
        description: formData.description,
        start: formatDateTime(formData.start),
        end: formatDateTime(formData.end),
        attendees: attendeesArray
      };

      console.log('Sending event data:', eventData);
      const response = await axios.post('/create-event/', eventData);
      console.log('Event created:', response.data);
      
      setSuccess(true);
      setFormData({
        summary: '',
        description: '',
        start: '',
        end: '',
        attendees: ''
      });

      console.log('Triggering event refresh...');
      if (onEventCreated) {
        await onEventCreated(); 
      }

    } catch (err) {
      console.error('Error creating event:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-form">
      <h2>Create New Event</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Event created successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="summary">Event Title:</label>
          <input
            type="text"
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData({...formData, summary: e.target.value})}
            required
            placeholder="Enter event title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Enter event description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="start">Start Time:</label>
          <input
            type="datetime-local"
            id="start"
            value={formData.start}
            onChange={(e) => setFormData({...formData, start: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="end">End Time:</label>
          <input
            type="datetime-local"
            id="end"
            value={formData.end}
            onChange={(e) => setFormData({...formData, end: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="attendees">Attendees:</label>
          <input
            type="text"
            id="attendees"
            value={formData.attendees}
            onChange={(e) => setFormData({...formData, attendees: e.target.value})}
            placeholder="Enter email addresses separated by commas"
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default CreateEventForm;