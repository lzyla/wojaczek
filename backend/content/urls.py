from django.urls import path
from . import views

urlpatterns = [
    path('points/', views.PointListView.as_view(), name='point-list'),
    path('poems/', views.PoemListView.as_view(), name='poem-list'),
    path('letters/', views.LetterListView.as_view(), name='letter-list'),
    path('gallery/', views.GalleryImageListView.as_view(), name='gallery-list'),
    path('timeline/', views.TimelineEventListView.as_view(), name='timeline-list'),
    path('audio/', views.AudioFileListView.as_view(), name='audio-list'),
    path('settings/', views.SiteSettingsView.as_view(), name='site-settings'),
]
