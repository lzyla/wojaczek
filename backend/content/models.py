from django.db import models


class Point(models.Model):
    title = models.CharField(max_length=200, verbose_name='Tytuł')
    category = models.CharField(max_length=100, verbose_name='Kategoria')
    lat = models.FloatField(verbose_name='Szerokość geo.')
    lng = models.FloatField(verbose_name='Długość geo.')
    description = models.TextField(verbose_name='Opis')
    audio_url = models.CharField(max_length=500, blank=True, default='', verbose_name='URL audio')
    image_url = models.CharField(max_length=500, blank=True, default='', verbose_name='URL obrazu')
    duration = models.CharField(max_length=20, blank=True, default='', verbose_name='Czas trwania')
    resource_count = models.IntegerField(default=0, verbose_name='Liczba zasobów')
    order = models.IntegerField(default=0, verbose_name='Kolejność')

    class Meta:
        verbose_name = 'Miejsce'
        verbose_name_plural = 'Miejsca'
        ordering = ['order']

    def __str__(self):
        return self.title


class MediaBlock(models.Model):
    BLOCK_TYPES = [
        ('text', 'Tekst'),
        ('photo', 'Zdjęcie'),
        ('gallery', 'Galeria'),
        ('audio', 'Audio'),
        ('video', 'Wideo'),
        ('map', 'Mapa'),
        ('beforeAfter', 'Przed/Po'),
        ('timeline', 'Oś czasu'),
        ('poem', 'Wiersz'),
    ]

    point = models.ForeignKey(
        Point, on_delete=models.CASCADE, related_name='media_blocks',
        verbose_name='Miejsce'
    )
    type = models.CharField(max_length=20, choices=BLOCK_TYPES, verbose_name='Typ bloku')
    order = models.IntegerField(default=0, verbose_name='Kolejność')
    content = models.JSONField(default=dict, verbose_name='Zawartość',
        help_text='Dane bloku w formacie JSON. Struktura zależy od typu bloku.')

    class Meta:
        verbose_name = 'Blok mediów'
        verbose_name_plural = 'Bloki mediów'
        ordering = ['order']

    def __str__(self):
        return f'{self.get_type_display()} #{self.order} — {self.point.title}'


class Poem(models.Model):
    title = models.CharField(max_length=200, verbose_name='Tytuł')
    content = models.TextField(verbose_name='Treść')
    year = models.CharField(max_length=10, blank=True, default='', verbose_name='Rok')

    class Meta:
        verbose_name = 'Wiersz'
        verbose_name_plural = 'Wiersze'

    def __str__(self):
        return self.title


class Letter(models.Model):
    to = models.CharField(max_length=200, verbose_name='Adresat')
    date = models.CharField(max_length=50, verbose_name='Data')
    excerpt = models.TextField(verbose_name='Fragment')

    class Meta:
        verbose_name = 'List'
        verbose_name_plural = 'Listy'

    def __str__(self):
        return f'Do {self.to} ({self.date})'


class GalleryImage(models.Model):
    url = models.URLField(max_length=500, blank=True, default='', verbose_name='URL obrazu')
    image = models.ImageField(upload_to='gallery/', blank=True, verbose_name='Plik obrazu')
    title = models.CharField(max_length=200, verbose_name='Tytuł')
    order = models.IntegerField(default=0, verbose_name='Kolejność')

    class Meta:
        verbose_name = 'Obraz galerii'
        verbose_name_plural = 'Obrazy galerii'
        ordering = ['order']

    def __str__(self):
        return self.title

    def get_url(self):
        if self.image:
            return self.image.url
        return self.url


class TimelineEvent(models.Model):
    year = models.CharField(max_length=10, verbose_name='Rok')
    title = models.CharField(max_length=200, verbose_name='Tytuł')
    description = models.TextField(verbose_name='Opis')
    order = models.IntegerField(default=0, verbose_name='Kolejność')

    class Meta:
        verbose_name = 'Wydarzenie'
        verbose_name_plural = 'Oś czasu'
        ordering = ['order']

    def __str__(self):
        return f'{self.year} — {self.title}'


class AudioFile(models.Model):
    title = models.CharField(max_length=200, verbose_name='Tytuł')
    file = models.FileField(upload_to='audio/', verbose_name='Plik audio')
    description = models.CharField(max_length=500, blank=True, default='', verbose_name='Opis')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Data dodania')

    class Meta:
        verbose_name = 'Plik audio'
        verbose_name_plural = 'Pliki audio'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.title


class SiteSettings(models.Model):
    map_center_lat = models.FloatField(default=50.1690, verbose_name='Centrum mapy — szer. geo.')
    map_center_lng = models.FloatField(default=18.9040, verbose_name='Centrum mapy — dł. geo.')
    map_zoom = models.IntegerField(default=15, verbose_name='Zoom mapy')
    map_detail_zoom = models.IntegerField(default=16, verbose_name='Zoom detalu')

    class Meta:
        verbose_name = 'Ustawienia'
        verbose_name_plural = 'Ustawienia'

    def __str__(self):
        return 'Ustawienia strony'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
