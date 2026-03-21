import json

from django import forms
from django.contrib import admin
from django.utils.html import format_html

from .models import Point, MediaBlock, Poem, Letter, GalleryImage, TimelineEvent, AudioFile, SiteSettings


# ---------------------------------------------------------------------------
# MediaBlock — friendly form with real fields instead of raw JSON
# ---------------------------------------------------------------------------

class MediaBlockForm(forms.ModelForm):
    """
    Shows human-readable fields per block type.
    JavaScript in the template hides/shows the right fields based on the
    selected type.  On save, visible fields are packed into the JSON
    `content` column.
    """

    # -- text --
    text_content = forms.CharField(
        label='Treść', required=False,
        widget=forms.Textarea(attrs={'rows': 4, 'class': 'vLargeTextField',
                                     'placeholder': 'Wpisz treść akapitu...'}),
    )

    # -- photo --
    photo_url = forms.URLField(label='URL zdjęcia', required=False,
                               widget=forms.URLInput(attrs={'class': 'vLargeTextField',
                                                            'placeholder': 'https://...'}))
    photo_caption = forms.CharField(label='Podpis', required=False,
                                    widget=forms.TextInput(attrs={'class': 'vLargeTextField'}))

    # -- audio --
    audio_url = forms.CharField(label='URL / ścieżka audio', required=False,
                                widget=forms.TextInput(attrs={'class': 'vLargeTextField',
                                                              'placeholder': '/audio/plik.mp3 lub https://...'}))
    audio_title = forms.CharField(label='Tytuł nagrania', required=False,
                                  widget=forms.TextInput(attrs={'class': 'vLargeTextField'}))

    # -- video --
    video_url = forms.URLField(label='URL embed (YouTube/Vimeo)', required=False,
                               widget=forms.URLInput(attrs={'class': 'vLargeTextField',
                                                            'placeholder': 'https://www.youtube.com/embed/...'}))
    video_platform = forms.ChoiceField(label='Platforma', required=False,
                                       choices=[('youtube', 'YouTube'), ('vimeo', 'Vimeo')])

    # -- poem --
    poem_title = forms.CharField(label='Tytuł wiersza', required=False,
                                 widget=forms.TextInput(attrs={'class': 'vLargeTextField'}))
    poem_content = forms.CharField(label='Treść wiersza', required=False,
                                   widget=forms.Textarea(attrs={'rows': 5, 'class': 'vLargeTextField',
                                                                'placeholder': 'Linia 1\nLinia 2\nLinia 3'}))
    poem_background = forms.CharField(label='Kolor tła', required=False, initial='#1a1a1a',
                                      widget=forms.TextInput(attrs={'type': 'color', 'style': 'width:60px;height:30px;'}))

    # -- map --
    map_lat = forms.FloatField(label='Szerokość geo.', required=False,
                               widget=forms.NumberInput(attrs={'step': '0.0001', 'style': 'width:140px;'}))
    map_lng = forms.FloatField(label='Długość geo.', required=False,
                               widget=forms.NumberInput(attrs={'step': '0.0001', 'style': 'width:140px;'}))
    map_zoom = forms.IntegerField(label='Zoom', required=False, initial=18,
                                  widget=forms.NumberInput(attrs={'min': 1, 'max': 22, 'style': 'width:60px;'}))

    # -- gallery (JSON kept, but with clear help) --
    gallery_json = forms.CharField(
        label='Zdjęcia galerii (JSON)', required=False,
        widget=forms.Textarea(attrs={'rows': 6, 'class': 'vLargeTextField',
                                     'style': 'font-family:monospace;font-size:12px;',
                                     'placeholder': '[{"url": "https://...", "caption": "Podpis"}, ...]'}),
        help_text='Lista zdjęć: [{"url": "link", "caption": "podpis"}, ...]',
    )

    # -- beforeAfter --
    ba_before_url = forms.URLField(label='URL — przed', required=False,
                                   widget=forms.URLInput(attrs={'class': 'vLargeTextField'}))
    ba_before_label = forms.CharField(label='Etykieta — przed', required=False,
                                      widget=forms.TextInput(attrs={'class': 'vLargeTextField'}))
    ba_after_url = forms.URLField(label='URL — po', required=False,
                                  widget=forms.URLInput(attrs={'class': 'vLargeTextField'}))
    ba_after_label = forms.CharField(label='Etykieta — po', required=False,
                                     widget=forms.TextInput(attrs={'class': 'vLargeTextField'}))

    # -- timeline (JSON kept) --
    timeline_json = forms.CharField(
        label='Wydarzenia (JSON)', required=False,
        widget=forms.Textarea(attrs={'rows': 6, 'class': 'vLargeTextField',
                                     'style': 'font-family:monospace;font-size:12px;',
                                     'placeholder': '[{"year": "1960", "title": "...", "description": "..."}, ...]'}),
        help_text='Lista wydarzeń: [{"year": "rok", "title": "tytuł", "description": "opis"}, ...]',
    )

    class Meta:
        model = MediaBlock
        fields = ['type', 'order', 'content']
        widgets = {
            'order': forms.NumberInput(attrs={'style': 'width:60px;'}),
            'content': forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Populate friendly fields from JSON content
        if self.instance and self.instance.pk and self.instance.content:
            c = self.instance.content
            t = self.instance.type
            if t == 'text':
                self.fields['text_content'].initial = c.get('content', '')
            elif t == 'photo':
                self.fields['photo_url'].initial = c.get('url', '')
                self.fields['photo_caption'].initial = c.get('caption', '')
            elif t == 'audio':
                self.fields['audio_url'].initial = c.get('url', '')
                self.fields['audio_title'].initial = c.get('title', '')
            elif t == 'video':
                self.fields['video_url'].initial = c.get('url', '')
                self.fields['video_platform'].initial = c.get('platform', 'youtube')
            elif t == 'poem':
                self.fields['poem_title'].initial = c.get('title', '')
                self.fields['poem_content'].initial = c.get('content', '')
                self.fields['poem_background'].initial = c.get('background', '#1a1a1a')
            elif t == 'map':
                self.fields['map_lat'].initial = c.get('lat')
                self.fields['map_lng'].initial = c.get('lng')
                self.fields['map_zoom'].initial = c.get('zoom', 18)
            elif t == 'gallery':
                self.fields['gallery_json'].initial = json.dumps(
                    c.get('images', []), indent=2, ensure_ascii=False)
            elif t == 'beforeAfter':
                self.fields['ba_before_url'].initial = c.get('before', {}).get('url', '')
                self.fields['ba_before_label'].initial = c.get('before', {}).get('label', '')
                self.fields['ba_after_url'].initial = c.get('after', {}).get('url', '')
                self.fields['ba_after_label'].initial = c.get('after', {}).get('label', '')
            elif t == 'timeline':
                self.fields['timeline_json'].initial = json.dumps(
                    c.get('events', []), indent=2, ensure_ascii=False)

    def clean(self):
        cleaned = super().clean()
        t = cleaned.get('type')
        content = {}

        if t == 'text':
            content = {'content': cleaned.get('text_content', '')}
        elif t == 'photo':
            content = {'url': cleaned.get('photo_url', ''),
                       'caption': cleaned.get('photo_caption', '')}
        elif t == 'audio':
            content = {'url': cleaned.get('audio_url', ''),
                       'title': cleaned.get('audio_title', '')}
        elif t == 'video':
            content = {'url': cleaned.get('video_url', ''),
                       'platform': cleaned.get('video_platform', 'youtube')}
        elif t == 'poem':
            content = {'title': cleaned.get('poem_title', ''),
                       'content': cleaned.get('poem_content', ''),
                       'background': cleaned.get('poem_background', '#1a1a1a')}
        elif t == 'map':
            content = {'lat': cleaned.get('map_lat'),
                       'lng': cleaned.get('map_lng'),
                       'zoom': cleaned.get('map_zoom', 18)}
        elif t == 'gallery':
            raw = cleaned.get('gallery_json', '[]')
            try:
                content = {'images': json.loads(raw)}
            except json.JSONDecodeError:
                raise forms.ValidationError('Galeria: niepoprawny format JSON')
        elif t == 'beforeAfter':
            content = {
                'before': {'url': cleaned.get('ba_before_url', ''),
                           'label': cleaned.get('ba_before_label', '')},
                'after': {'url': cleaned.get('ba_after_url', ''),
                          'label': cleaned.get('ba_after_label', '')},
            }
        elif t == 'timeline':
            raw = cleaned.get('timeline_json', '[]')
            try:
                content = {'events': json.loads(raw)}
            except json.JSONDecodeError:
                raise forms.ValidationError('Oś czasu: niepoprawny format JSON')

        cleaned['content'] = content
        return cleaned


# Group field names by type for the JS visibility toggle
FIELDS_BY_TYPE = {
    'text': ['text_content'],
    'photo': ['photo_url', 'photo_caption'],
    'audio': ['audio_url', 'audio_title'],
    'video': ['video_url', 'video_platform'],
    'poem': ['poem_title', 'poem_content', 'poem_background'],
    'map': ['map_lat', 'map_lng', 'map_zoom'],
    'gallery': ['gallery_json'],
    'beforeAfter': ['ba_before_url', 'ba_before_label', 'ba_after_url', 'ba_after_label'],
    'timeline': ['timeline_json'],
}

ALL_EXTRA_FIELDS = []
for _flds in FIELDS_BY_TYPE.values():
    ALL_EXTRA_FIELDS.extend(_flds)


class MediaBlockInline(admin.StackedInline):
    model = MediaBlock
    form = MediaBlockForm
    extra = 1
    ordering = ['order']
    can_delete = True
    verbose_name = 'Blok mediów'
    verbose_name_plural = 'Bloki mediów'
    fields = ['type', 'order', 'content'] + ALL_EXTRA_FIELDS

    class Media:
        css = {'all': ('admin/css/mediablock.css',)}
        js = ('admin/js/mediablock.js',)

    def get_extra(self, request, obj=None, **kwargs):
        if obj and obj.media_blocks.exists():
            return 1
        return 1


# ---------------------------------------------------------------------------
# Standalone MediaBlock admin
# ---------------------------------------------------------------------------

@admin.register(MediaBlock)
class MediaBlockAdmin(admin.ModelAdmin):
    list_display = ['block_preview', 'point', 'type', 'order', 'content_summary']
    list_editable = ['order']
    list_filter = ['type', 'point']
    list_select_related = ['point']
    ordering = ['point', 'order']
    form = MediaBlockForm
    fields = ['point', 'type', 'order', 'content'] + ALL_EXTRA_FIELDS

    class Media:
        css = {'all': ('admin/css/mediablock.css',)}
        js = ('admin/js/mediablock.js',)

    @admin.display(description='Blok')
    def block_preview(self, obj):
        colors = {
            'text': '#5B8C5A', 'photo': '#4A90D9', 'gallery': '#7B68EE',
            'audio': '#D4A843', 'video': '#C23030', 'map': '#2E8B57',
            'beforeAfter': '#8B6914', 'timeline': '#6A5ACD', 'poem': '#9B2335',
        }
        labels = {
            'text': 'Aa', 'photo': 'IMG', 'gallery': 'GAL',
            'audio': 'AUD', 'video': 'VID', 'map': 'MAP',
            'beforeAfter': 'B/A', 'timeline': 'TIME', 'poem': 'POEM',
        }
        color = colors.get(obj.type, '#666')
        label = labels.get(obj.type, '?')
        return format_html(
            '<span style="display:inline-block;padding:3px 8px;background:{};color:#fff;'
            'border-radius:4px;font-size:10px;font-weight:bold;letter-spacing:0.5px;">{}</span>',
            color, label,
        )

    @admin.display(description='Zawartość')
    def content_summary(self, obj):
        c = obj.content
        if not c:
            return '—'
        summaries = {
            'text': lambda: (c.get('content', '') or '')[:100],
            'photo': lambda: f"{c.get('caption', '')} — {(c.get('url', '') or '')[:50]}",
            'audio': lambda: f"{c.get('title', '')} — {c.get('url', '')}",
            'video': lambda: f"{c.get('platform', '')} — {(c.get('url', '') or '')[:50]}",
            'gallery': lambda: f"{len(c.get('images', []))} zdjęć",
            'poem': lambda: c.get('title', ''),
            'map': lambda: f"lat={c.get('lat')}, lng={c.get('lng')}, zoom={c.get('zoom')}",
            'timeline': lambda: f"{len(c.get('events', []))} wydarzeń",
            'beforeAfter': lambda: f"{c.get('before', {}).get('label', '')} / {c.get('after', {}).get('label', '')}",
        }
        fn = summaries.get(obj.type)
        return fn() if fn else str(c)[:80]


# ---------------------------------------------------------------------------
# Point
# ---------------------------------------------------------------------------

@admin.register(Point)
class PointAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'lat', 'lng', 'duration', 'media_count', 'order']
    list_editable = ['order']
    list_filter = ['category']
    search_fields = ['title', 'description']
    inlines = [MediaBlockInline]
    fieldsets = (
        (None, {'fields': ('title', 'category', 'description')}),
        ('Lokalizacja', {'fields': (('lat', 'lng'),)}),
        ('Media', {'fields': ('audio_url', 'image_url')}),
        ('Inne', {'fields': (('duration', 'resource_count', 'order'),)}),
    )

    @admin.display(description='Bloków')
    def media_count(self, obj):
        count = obj.media_blocks.count()
        return format_html(
            '<span style="background:#e0e0e0;padding:2px 10px;border-radius:12px;'
            'font-size:11px;font-weight:bold;">{}</span>', count)


# ---------------------------------------------------------------------------
# Other models
# ---------------------------------------------------------------------------

@admin.register(Poem)
class PoemAdmin(admin.ModelAdmin):
    list_display = ['title', 'year', 'content_preview']
    search_fields = ['title', 'content']

    @admin.display(description='Fragment')
    def content_preview(self, obj):
        return obj.content[:60] + '...' if len(obj.content) > 60 else obj.content


@admin.register(Letter)
class LetterAdmin(admin.ModelAdmin):
    list_display = ['to', 'date', 'excerpt_preview']
    search_fields = ['to', 'excerpt']

    @admin.display(description='Fragment')
    def excerpt_preview(self, obj):
        return obj.excerpt[:60] + '...' if len(obj.excerpt) > 60 else obj.excerpt


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'image_preview', 'order']
    list_editable = ['order']
    search_fields = ['title']

    @admin.display(description='Podgląd')
    def image_preview(self, obj):
        url = obj.get_url()
        if url:
            return format_html(
                '<img src="{}" style="height:40px;border-radius:4px;object-fit:cover;" />', url)
        return '—'


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ['year', 'title', 'order']
    list_editable = ['order']
    ordering = ['order']


@admin.register(AudioFile)
class AudioFileAdmin(admin.ModelAdmin):
    list_display = ['title', 'file', 'description', 'uploaded_at']
    search_fields = ['title', 'description']
    readonly_fields = ['uploaded_at']


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


# ---------------------------------------------------------------------------
# Admin site branding
# ---------------------------------------------------------------------------
admin.site.site_header = 'Wojaczek — Mapa Obecności'
admin.site.site_title = 'Panel Admina'
admin.site.index_title = 'Zarządzanie treścią'
