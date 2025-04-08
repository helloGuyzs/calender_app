# Calendar App

## Overview

The Calendar App is a Django-based application that allows users to manage their calendar events using the Google Calendar API. Users can authenticate with their Google account, create events, list events, and delete events.

## Features

- User authentication with Google
- Create events with Google Meet links
- List upcoming events
- Delete events from the calendar

## Requirements

- Python 3.11
- Django 5.2
- Django REST Framework
- Google API Client Library

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd calendar_app
   ```

2. Create a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows use `env\Scripts\activate`
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up your Google API credentials:
   - Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
   - Enable the Google Calendar API.
   - Create OAuth 2.0 credentials and download the `credentials.json` file.
   - Update the `redirect_uris` in `credentials.json` to match your ngrok URL.

5. Set environment variables:
   - Create a `.env` file in the project root and add the following:
     ```
     GOOGLE_REDIRECT_URI=https://<your-ngrok-url>/oauth2callback
     ```

## Running the Application

1. Run database migrations:
   ```bash
   python manage.py migrate
   ```

2. Start the development server:
   ```bash
   python manage.py runserver
   ```

3. Access the application at `http://localhost:8000`.

## Obtaining Your Session ID

After successfully logging in with Google, your session ID will be stored in your browser's cookies. You can obtain your session ID by following these steps:

1. **Log in to the Application**:
   - Navigate to the Google login endpoint: `http://localhost:8000/google-login/`.
   - Complete the Google authentication process.

2. **Check Your Browser's Cookies**:
   - Open your browser's developer tools (usually by right-clicking on the page and selecting "Inspect" or pressing `F12`).
   - Go to the "Application" tab (in Chrome) or "Storage" tab (in Firefox).
   - Look for "Cookies" in the left sidebar and select your application's URL (e.g., `http://localhost:8000`).
   - Find the cookie named `sessionid`. This is your session ID.

3. **Use the Session ID in API Requests**:
   - Include the session ID in the `Cookie` header of your API requests.

## API Endpoints

### 1. Google Login

**Endpoint**: `/google-login/`  
**Method**: GET  
**Description**: Initiates the Google OAuth2 login process.

### 2. OAuth2 Callback

**Endpoint**: `/oauth2callback`  
**Method**: GET  
**Description**: Handles the OAuth2 callback from Google after authentication.

### 3. List Events

**Endpoint**: `/events/`  
**Method**: GET  
**Description**: Retrieves a list of upcoming events from the user's Google Calendar.

**Example `curl` Command**:
```bash
curl --location 'https://a9c6-106-216-252-199.ngrok-free.app/events/' \
--header 'Cookie: sessionid=<your-session-id>'
```

### 4. Create Event

**Endpoint**: `/create-event/`  
**Method**: POST  
**Description**: Creates a new event in the user's Google Calendar.

**Request Body**:
```json
{
    "summary": "Event Title",
    "description": "Event Description",
    "start": {
        "dateTime": "2023-10-01T10:00:00-07:00"
    },
    "end": {
        "dateTime": "2023-10-01T11:00:00-07:00"
    }
}
```

### 5. Delete Event

**Endpoint**: `/delete-event/<event_id>/`  
**Method**: DELETE  
**Description**: Deletes an event from the user's Google Calendar.

**Example `curl` Command**:
```bash
curl --location --request DELETE 'https://a9c6-106-216-252-199.ngrok-free.app/delete-event/<event_id>/' \
--header 'Cookie: sessionid=<your-session-id>'
```

## Notes

- Ensure that your session ID is valid and that you are authenticated to access these endpoints.
- Replace `<your-session-id>` and `<event_id>` in the commands with your actual session ID and event ID as needed.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Django](https://www.djangoproject.com/)
- [Google Calendar API](https://developers.google.com/calendar)
- [Django REST Framework](https://www.django-rest-framework.org/)