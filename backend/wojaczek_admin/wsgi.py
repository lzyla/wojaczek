"""
WSGI config for wojaczek_admin project.
"""

import os
import sys

# PythonAnywhere: dodaj katalog projektu do ścieżki
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.insert(0, path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wojaczek_admin.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
