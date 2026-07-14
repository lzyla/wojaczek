# Dokumentacja wdrożeniowa aplikacji `wojaczek`

## 1. Cel dokumentu

Dokument opisuje sposób wdrożenia aplikacji `wojaczek` w obecnym kształcie repozytorium. Obejmuje:

- frontend SPA zbudowany w `Vite + React`,
- funkcje AI dostępne pod `/api/*`,
- opcjonalny backend CMS/API w `Django`,
- wymagane zmienne środowiskowe,
- ograniczenia aktualnej architektury.

## 2. Architektura rozwiązania

Repozytorium zawiera trzy niezależne warstwy:

| Warstwa | Lokalizacja | Rola | Docelowa platforma |
| --- | --- | --- | --- |
| Frontend | `/` | aplikacja SPA, assety statyczne, logika UI | Vercel lub inny hosting statyczny |
| Funkcje AI | `/api` | chat i generowanie wierszy przez Anthropic | Vercel |
| Backend CMS/API | `/backend` | panel admina, REST API, dane edytowalne | Railway |

Najważniejsze zależności:

- frontend może działać bez backendu Django, bo ma fallback do danych lokalnych,
- endpointy `/api/chat` i `/api/generate-poem` są przygotowane pod Vercel Functions,
- backend Django udostępnia edytowalne treści pod `/api/*` oraz panel `/admin/`,
- część funkcji AI po stronie klienta korzysta z kluczy build-time lub z integracji `AI Studio`.

## 3. Obsługiwane warianty wdrożenia

### Wariant A: rekomendowany

`Vercel (frontend + /api)` + `Railway (backend Django)`

Ten wariant zapewnia:

- działający frontend,
- działający chat i generator wierszy,
- działający panel administracyjny i REST API,
- możliwość zarządzania treścią bez zmian w kodzie.

### Wariant B: uproszczony

`Vercel (frontend + /api)` bez backendu Django

Ten wariant zapewnia:

- działający frontend,
- działający chat i generator wierszy,
- dane ładowane z lokalnych stałych w frontendzie,
- brak panelu admina i brak zdalnej edycji treści.

### Wariant C: statyczny hosting frontendu poza Vercel

Możliwy technicznie, ale z ograniczeniami:

- frontend będzie działał,
- jeśli nie ma obsługi `/api/chat` i `/api/generate-poem`, funkcje AI oparte o te endpointy nie będą działać,
- rootowy `railway.toml` uruchamia wyłącznie zbudowane `dist`, bez funkcji serwerowych Vercel.

## 4. Wymagania

### Wymagania aplikacyjne

- Node.js 18+,
- npm,
- Python 3.12 dla backendu,
- konto Vercel,
- konto Railway.

### Wymagania operacyjne

- osobne domeny lub subdomeny dla frontendu i backendu,
- bezpieczne przechowywanie sekretów poza repozytorium,
- ograniczenia domenowe dla kluczy map i usług zewnętrznych.

## 5. Zmienne środowiskowe

### 5.1. Frontend i funkcje Vercel

| Zmienna | Wymagana | Gdzie używana | Uwagi |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | tak, jeśli ma działać chat i generator wierszy | `/api/chat`, `/api/generate-poem` | sekret serwerowy, ustawiać wyłącznie po stronie Vercel |
| `VITE_API_URL` | opcjonalnie | frontend | pełny adres do backendu Django, np. `https://backend.example.com/api` |
| `VITE_MAPBOX_TOKEN` | opcjonalnie, ale zalecane | frontend | wymagany do widoku nawigacji 3D; bez niego działa fallback do linku Google Maps |
| `VITE_GOOGLE_MAPS_KEY` | nie | frontend | w obecnym kodzie zdefiniowany, ale niewykorzystywany runtime |
| `GEMINI_API_KEY` | opcjonalnie | build frontendu | w obecnym kodzie wstrzykiwany do bundla klienta; niezalecane w publicznej produkcji |
| `VITE_ELEVENLABS_API_KEY` | opcjonalnie | frontend | klucz trafia do przeglądarki; niezalecane w publicznej produkcji |

Przykład:

```env
ANTHROPIC_API_KEY=...
VITE_API_URL=https://backend.example.com/api
VITE_MAPBOX_TOKEN=...
```

### 5.2. Backend Django na Railway

| Zmienna | Wymagana | Uwagi |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | tak | ustawić własną wartość produkcyjną |
| `DJANGO_DEBUG` | tak | w produkcji `false` |
| `DJANGO_ALLOWED_HOSTS` | tak | lista hostów rozdzielona przecinkami |
| `CORS_ALLOWED_ORIGINS` | tak | pełne originy frontendu, rozdzielone przecinkami |
| `CSRF_TRUSTED_ORIGINS` | tak | pełne adresy HTTPS frontendu i backendu |
| `PORT` | nie | ustawiane automatycznie przez Railway |
| `RAILWAY_PUBLIC_DOMAIN` | nie | ustawiane automatycznie przez Railway |

Przykład:

```env
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=backend.example.com
CORS_ALLOWED_ORIGINS=https://app.example.com
CSRF_TRUSTED_ORIGINS=https://app.example.com,https://backend.example.com
```

## 6. Procedura wdrożenia rekomendowanego

### 6.1. Backend Django na Railway

1. Utworzyć nowy serwis Railway z katalogiem roboczym ustawionym na `/backend`.
2. Upewnić się, że Railway korzysta z plików:
   - `/backend/railway.toml`
   - `/backend/nixpacks.toml`
3. Dodać zmienne środowiskowe z sekcji 5.2.
4. Wdrożyć serwis.

Obecny start backendu wykonuje automatycznie:

```bash
python manage.py migrate --noinput
python manage.py collectstatic --noinput
gunicorn wojaczek_admin.wsgi --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

Po pierwszym wdrożeniu wykonać jednorazowo:

```bash
python manage.py seed_data
python manage.py createsuperuser
```

Punkty kontrolne backendu:

- `https://<backend-domain>/api/settings/` zwraca `200`,
- `https://<backend-domain>/admin/` otwiera panel administracyjny.

### 6.2. Frontend i funkcje `/api` na Vercel

1. Zaimportować repozytorium do Vercel z rootem ustawionym na `/`.
2. Pozostawić domyślną konfigurację z `vercel.json`.
3. Dodać zmienne środowiskowe z sekcji 5.1.
4. Wykonać wdrożenie.

Obecna konfiguracja frontendu:

- build command: `npm run build`,
- output directory: `dist`,
- SPA rewrite do `index.html`,
- funkcje z katalogu `/api` publikowane jako endpointy Vercel.

Jeśli backend Django ma być używany, `VITE_API_URL` musi wskazywać dokładnie na bazę API z końcówką `/api`, np.:

```text
https://backend.example.com/api
```

### 6.3. Powiązanie frontendu z backendem

Po wdrożeniu obu usług:

1. ustawić `VITE_API_URL` w Vercel,
2. ustawić `CORS_ALLOWED_ORIGINS` i `CSRF_TRUSTED_ORIGINS` w Railway,
3. wykonać ponowne wdrożenie frontendu i backendu.

## 7. Procedura uproszczona bez backendu Django

Jeżeli aplikacja ma działać bez CMS:

1. wdrożyć root projektu na Vercel,
2. nie ustawiać `VITE_API_URL`,
3. ustawić tylko te klucze, które są potrzebne do aktywnych funkcji.

W tym trybie:

- treści `points`, `poems`, `gallery`, `timeline` i `letters` ładują się z lokalnych stałych,
- interpretacje są ładowane ze statycznych plików JSON z `public/interpretations`,
- chat i generator wierszy nadal działają, jeśli ustawiono `ANTHROPIC_API_KEY`,
- panel admina Django nie jest używany.

## 8. Checklista powdrożeniowa

Po wdrożeniu należy sprawdzić:

1. Czy otwiera się strona główna i nawigacja po widokach.
2. Czy endpoint `GET https://<backend-domain>/api/settings/` zwraca `200`.
3. Czy lista miejsc, wierszy i galerii ładuje się z backendu po ustawieniu `VITE_API_URL`.
4. Czy chat działa z poziomu widoku biografii.
5. Czy generator wierszy działa i streamuje odpowiedź.
6. Czy pliki audio z `public/audio` odtwarzają się poprawnie.
7. Czy widok nawigacji działa z `VITE_MAPBOX_TOKEN`.
8. Czy panel `/admin/` pozwala zalogować administratora.

## 9. Ograniczenia i ryzyka aktualnej implementacji

### 9.1. SQLite w produkcji

Backend używa lokalnej bazy `sqlite3`. W Railway oznacza to brak odporności produkcyjnej:

- dane mogą zostać utracone po przebudowie lub zmianie instancji,
- brak współdzielenia między replikami,
- brak wygodnego backupu i skalowania.

Do wdrożenia produkcyjnego zalecana jest migracja na PostgreSQL.

### 9.2. Media i uploady

`MEDIA_ROOT` wskazuje na lokalny katalog backendu. To oznacza, że uploady z panelu admina nie mają trwałego storage.

Do produkcji zalecane jest użycie zewnętrznego storage, np. S3-compatible.

### 9.3. Klucze po stronie klienta

Aktualny kod wystawia część integracji bezpośrednio do przeglądarki:

- `GEMINI_API_KEY` jest wstrzykiwany do bundla na etapie builda,
- `VITE_ELEVENLABS_API_KEY` jest dostępny w kodzie klienta.

Taki model jest dopuszczalny wyłącznie dla środowisk testowych lub wewnętrznych. W publicznej produkcji te integracje powinny zostać przeniesione za warstwę serwerową.

### 9.4. Integracja `AI Studio`

Część logiki Gemini zakłada obecność `window.aistudio`. Poza środowiskiem AI Studio selektor klucza nie będzie dostępny.

W publicznym wdrożeniu należy przyjąć jedno z dwóch rozwiązań:

- przenieść wywołania Gemini na backend,
- albo wyłączyć te funkcje w publicznej wersji aplikacji.

### 9.5. PWA i offline

W repozytorium istnieją `public/sw.js` i `public/manifest.json`, ale service worker nie jest obecnie rejestrowany w `src/main.tsx`.

W praktyce oznacza to:

- manifest jest publikowany,
- pełny cache offline nie jest aktywny.

### 9.6. Sekrety w plikach lokalnych

Zmienne środowiskowe powinny być przechowywane poza repozytorium i poza publicznym buildem. Przed wdrożeniem produkcyjnym należy:

- upewnić się, że pliki `.env*` nie są publikowane,
- trzymać sekrety w Vercel/Railway,
- zrotować klucze, jeśli były wcześniej udostępnione lub wersjonowane.

## 10. Rekomendacje przed produkcją

Minimalny zakres prac przed publicznym uruchomieniem:

1. przenieść bazę z SQLite do PostgreSQL,
2. przenieść media do zewnętrznego storage,
3. przenieść Gemini i ElevenLabs za backend,
4. zdecydować, czy PWA ma faktycznie działać offline i ewentualnie zarejestrować service worker,
5. ograniczyć domenowo klucze Mapbox i innych usług klienckich,
6. dodać monitoring błędów i logowanie aplikacyjne.

## 11. Podsumowanie

Najbezpieczniejszy obecnie model wdrożenia to:

- `Vercel` dla frontendu i endpointów `/api/chat` oraz `/api/generate-poem`,
- `Railway` dla backendu Django uruchamianego z katalogu `/backend`.

Wariant bez backendu Django jest możliwy i prostszy, ale ogranicza zarządzanie treścią do danych zaszytych w repozytorium.
