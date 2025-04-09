import os
import json
from django.shortcuts import redirect
from django.http import HttpResponse
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.http import JsonResponse
from rest_framework.decorators import api_view
import uuid
from rest_framework import status
from datetime import datetime
import pytz
from http import HTTPStatus
from rest_framework.views import APIView
from utils import handle_response

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"  # Dev only

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def google_login(request):
    flow = Flow.from_client_secrets_file(
        os.path.join(BASE_DIR, 'credentials.json'),
        scopes=['https://www.googleapis.com/auth/calendar'],
        redirect_uri=settings.GOOGLE_REDIRECT_URI
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    request.session['state'] = state
    return redirect(authorization_url)

def oauth2callback(request):
    state = request.GET.get('state')
    
    if not state:
        return HttpResponse("State param missing")

    flow = Flow.from_client_secrets_file(
        os.path.join(BASE_DIR, 'credentials.json'),
        scopes=['https://www.googleapis.com/auth/calendar'],
        state=state,
        redirect_uri=settings.GOOGLE_REDIRECT_URI
    )
    flow.fetch_token(authorization_response=request.build_absolute_uri())

    credentials = flow.credentials
    request.session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }
    
    response = redirect("http://3.108.68.73:3000/oauth2callback")
    response.set_cookie(
        'sessionid',
        request.session.session_key,
        secure=True,  # Only sent over HTTPS
        httponly=True,
        samesite='None',  # Allow cross-site
        domain=None,
        max_age=1209600  # 2 weeks
    )
    return response

@api_view(['POST'])
def logout(request):
    try:
        # Clear the session
        request.session.flush()
        # Delete the session cookie
        response = handle_response(
            status_code=HTTPStatus.OK,
            status="Success",
            message="Logged out successfully"
        )
        response.delete_cookie('sessionid')
        return response
    except Exception as e:
        return handle_response(
            status_code=HTTPStatus.BAD_REQUEST,
            status="Failed", 
            message="Logout failed",
            error=str(e)
        )

@api_view(['POST'])
def create_event(request):
    # Step 1: Get credentials from session
    creds_data = request.session.get('credentials')
    if not creds_data:
        return handle_response(
            status_code=HTTPStatus.UNAUTHORIZED,
            status="Failed",
            message="User not authenticated with Google"
        )

    creds = Credentials(
        token=creds_data['token'],
        refresh_token=creds_data.get('refresh_token'),
        token_uri=creds_data['token_uri'],
        client_id=creds_data['client_id'],
        client_secret=creds_data['client_secret'],
        scopes=creds_data['scopes']
    )

    service = build('calendar', 'v3', credentials=creds)

    # Step 2: Read data from request
    data = request.data
    attendees_emails = data.get('attendees', [])

    # Step 3: Create event with Meet link and attendees
    event = {
        'summary': data.get('summary', 'Meeting'),
        'description': data.get('description', ''),
        'start': {
            'dateTime': data.get('start'),
            'timeZone': 'Asia/Kolkata',
        },
        'end': {
            'dateTime': data.get('end'),
            'timeZone': 'Asia/Kolkata',
        },
        'attendees': [{'email': email} for email in attendees_emails],
        'conferenceData': {
            'createRequest': {
                'requestId': str(uuid.uuid4()),  # ensure unique Meet ID
                'conferenceSolutionKey': {
                    'type': 'hangoutsMeet'
                }
            }
        }
    }

    try:
        created_event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1,
            sendUpdates='all'
        ).execute()

        meet_link = created_event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri')

        return handle_response(
            status_code=HTTPStatus.CREATED,
            status="Success",
            message="Event created successfully",
            response={
                'event_summary': created_event.get('summary'),
                'event_link': created_event.get('htmlLink'),
                'meet_link': meet_link,
                'start': created_event.get('start'),
                'end': created_event.get('end'),
            }
        )

    except Exception as error:
        return handle_response(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            status="Failed",
            message="Error creating event",
            error=str(error)
        )

@api_view(['GET'])
def list_events(request):
    # Check for credentials in session
    if 'credentials' not in request.session:
        return handle_response(
            status_code=HTTPStatus.UNAUTHORIZED,
            status="Failed",
            message="User not authenticated with Google"
        )

    creds_data = request.session['credentials']
    creds = Credentials.from_authorized_user_info(info=creds_data)

    service = build('calendar', 'v3', credentials=creds)

    # Get current time in RFC3339 format
    now = datetime.utcnow().isoformat() + 'Z'

    # Fetch upcoming 10 events
    try:
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            maxResults=10,
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        events = events_result.get('items', [])

        formatted_events = []
        for event in events:
            formatted_events.append({
                'id':event.get('id'),
                'summary': event.get('summary'),
                'description': event.get('description'),
                'start': event['start'].get('dateTime', event['start'].get('date')),
                'end': event['end'].get('dateTime', event['end'].get('date')),
                'meet_link': event.get('hangoutLink'),
                'event_link': event.get('htmlLink'),
                'attendees': [att['email'] for att in event.get('attendees', [])] if event.get('attendees') else []
            })

        return handle_response(
            status_code=HTTPStatus.OK,
            status="Success",
            message="Events retrieved successfully",
            response={'events': formatted_events}
        )

    except Exception as error:
        return handle_response(
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            status="Failed",
            message="Error fetching events",
            error=str(error)
        )


@api_view(['DELETE'])
def delete_event(request, event_id):
    if 'credentials' not in request.session:
        return handle_response(
            status_code=status.HTTP_401_UNAUTHORIZED,
            status="Failed",
            message="User not authenticated with Google"
        )

    creds_data = request.session['credentials']
    creds = Credentials.from_authorized_user_info(info=creds_data)

    try:
        service = build('calendar', 'v3', credentials=creds)

        service.events().delete(
            calendarId='primary',
            eventId=event_id,
            sendUpdates='all'  # Sends cancellation emails to attendees
        ).execute()

        return handle_response(
            status_code=status.HTTP_200_OK,
            status="Success",
            message=f"Event with ID {event_id} has been deleted."
        )

    except Exception as e:
        return handle_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            status="Failed",
            message="Error deleting event",
            error=str(e)
        )

@api_view(['GET'])
def check_calendar_connection(request):
    if 'credentials' in request.session:
        return handle_response(
            status_code=HTTPStatus.OK,
            status="Success",
            message="Calendar is connected",
            response={'isConnected': True}
        )
    else:
        return handle_response(
            status_code=HTTPStatus.OK,
            status="Success",
            message="Calendar is not connected",
            response={'isConnected': False}
        )

