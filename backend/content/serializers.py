from rest_framework import serializers
from .models import Point, MediaBlock, Poem, Letter, GalleryImage, TimelineEvent, AudioFile, SiteSettings


class MediaBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaBlock
        fields = ['type', 'order', 'content']

    def to_representation(self, instance):
        """Flatten: merge type with content dict to match frontend MediaBlock shape."""
        data = {}
        if isinstance(instance.content, dict):
            data = instance.content.copy()
        data['type'] = instance.type
        return data


class PointSerializer(serializers.ModelSerializer):
    media = MediaBlockSerializer(source='media_blocks', many=True, read_only=True)
    audioUrl = serializers.CharField(source='audio_url')
    imageUrl = serializers.CharField(source='image_url')
    resourceCount = serializers.IntegerField(source='resource_count')

    class Meta:
        model = Point
        fields = [
            'id', 'title', 'category', 'lat', 'lng', 'description',
            'audioUrl', 'imageUrl', 'duration', 'resourceCount', 'media',
        ]


class PoemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poem
        fields = ['id', 'title', 'content', 'year']


class LetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Letter
        fields = ['id', 'to', 'date', 'excerpt']


class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['id', 'url', 'title']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                data['url'] = request.build_absolute_uri(instance.image.url)
            else:
                data['url'] = instance.image.url
        return data


class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = ['year', 'title', 'description']


class AudioFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = AudioFile
        fields = ['id', 'title', 'url', 'description']

    def get_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ['map_center_lat', 'map_center_lng', 'map_zoom', 'map_detail_zoom']
