from django.urls import path
from . import views

urlpatterns = [
    path('google-login/', views.google_login, name='google-login'),
    path('oauth2callback', views.oauth2callback, name='oauth2callback'),
    path('create-event/', views.create_event, name='create_event'), 
    path('events/', views.list_events, name='list_events'),
    path('delete-event/<str:event_id>/', views.delete_event, name='delete_event'),
]
