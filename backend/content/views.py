from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Point, Poem, Letter, GalleryImage, TimelineEvent, AudioFile, SiteSettings
from .serializers import (
    PointSerializer, PoemSerializer, LetterSerializer,
    GalleryImageSerializer, TimelineEventSerializer, AudioFileSerializer,
    SiteSettingsSerializer,
)


class PointListView(ListAPIView):
    queryset = Point.objects.prefetch_related('media_blocks').all()
    serializer_class = PointSerializer


class PoemListView(ListAPIView):
    queryset = Poem.objects.all()
    serializer_class = PoemSerializer


class LetterListView(ListAPIView):
    queryset = Letter.objects.all()
    serializer_class = LetterSerializer


class GalleryImageListView(ListAPIView):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer


class TimelineEventListView(ListAPIView):
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer


class AudioFileListView(ListAPIView):
    queryset = AudioFile.objects.all()
    serializer_class = AudioFileSerializer


class SiteSettingsView(APIView):
    def get(self, request):
        settings = SiteSettings.load()
        return Response(SiteSettingsSerializer(settings).data)
