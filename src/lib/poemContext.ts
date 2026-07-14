/**
 * Live context gathering for poem generation.
 * Collects: weather, location, time, philosophy motif, current events context.
 */

// ── Weather via OpenMeteo (free, no key) ──

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  isDay: boolean;
}

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'czyste niebo',
  1: 'prawie czyste', 2: 'częściowe zachmurzenie', 3: 'zachmurzenie całkowite',
  45: 'mgła', 48: 'mgła szronowa',
  51: 'mżawka', 53: 'mżawka', 55: 'gęsta mżawka',
  61: 'lekki deszcz', 63: 'deszcz', 65: 'ulewny deszcz',
  66: 'marznący deszcz', 67: 'marznący deszcz',
  71: 'lekki śnieg', 73: 'śnieg', 75: 'intensywny śnieg',
  77: 'ziarna śniegu',
  80: 'przelotny deszcz', 81: 'przelotny deszcz', 82: 'gwałtowny deszcz',
  85: 'przelotny śnieg', 86: 'intensywny przelotny śnieg',
  95: 'burza', 96: 'burza z gradem', 99: 'burza z silnym gradem',
};

async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const resp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const c = data.current;
    return {
      temperature: c.temperature_2m,
      weatherCode: c.weather_code,
      windSpeed: c.wind_speed_10m,
      isDay: c.is_day === 1,
    };
  } catch {
    return null;
  }
}

// ── Geolocation ──

interface LocationData {
  lat: number;
  lng: number;
  nearestPoint?: { title: string; distance: number };
}

function getUserLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  });
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Known Wojaczek points in Mikołów
const WOJACZEK_POINTS = [
  { title: 'Dom Rodzinny Wojaczka', lat: 50.1706, lng: 18.9054 },
  { title: 'Pomnik Rafała Wojaczka', lat: 50.1696, lng: 18.9049 },
  { title: 'Rynek w Mikołowie', lat: 50.1685, lng: 18.9045 },
  { title: 'I Liceum Ogólnokształcące', lat: 50.1679, lng: 18.8939 },
  { title: 'Miejski Dom Kultury', lat: 50.1696, lng: 18.9044 },
  { title: 'Park Planty', lat: 50.1690, lng: 18.9016 },
  { title: 'Ulica Rafała Wojaczka', lat: 50.1600, lng: 18.9038 },
];

// ── Time / Season ──

interface TimeData {
  hour: number;
  dayOfWeek: string;
  month: string;
  season: string;
  dayOrNight: string;
  date: string;
  year: number;
}

function getTimeData(): TimeData {
  const now = new Date();
  const h = now.getHours();
  const months = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
  const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const m = now.getMonth();
  const seasons = m <= 1 || m === 11 ? 'zima' : m <= 4 ? 'wiosna' : m <= 7 ? 'lato' : 'jesień';
  const dayOrNight = h >= 6 && h < 21 ? (h >= 17 ? 'wieczór' : 'dzień') : (h >= 21 || h < 1 ? 'wieczór' : 'noc');

  return {
    hour: h,
    dayOfWeek: days[now.getDay()],
    month: months[m],
    season: seasons,
    dayOrNight: h < 5 ? 'głęboka noc' : dayOrNight,
    date: `${now.getDate()} ${months[m]} ${now.getFullYear()}`,
    year: now.getFullYear(),
  };
}

// ── Philosophy / Science / Poetry Motifs ──

interface Motif {
  name: string;
  context: string;
}

const MOTIFS: Motif[] = [
  { name: 'Derrida — différance', context: 'Różnia (différance) Derridy: znaczenie jest zawsze odroczone, nigdy w pełni obecne. Język nie dociera do rzeczy, kręci się wokół pustki. Ślad zamiast obecności.' },
  { name: 'Celan — język po Auschwitz', context: 'Paul Celan: poezja po Zagładzie. Język musi mówić z wnętrza katastrofy. Fuga śmierci. Czarny mleko świtu. Grób w obłokach.' },
  { name: 'Leśmian — byt na granicy', context: 'Bolesław Leśmian: ontologia tego, co nie istnieje. Nicość, która tworzy byt. Dziewczyna, która jest śniegiem. Zieleni, które nigdy nie są dosyć zielone.' },
  { name: 'Białoszewski — mowa potoczna', context: 'Miron Białoszewski: rozbijanie języka na cząstki. Kabaret lingwistyczny. Teatr Osobny. Pamiętnik z powstania warszawskiego pisany ustami. Ooo, Yyy. Nanizanie.' },
  { name: 'Heidegger — bycie-ku-śmierci', context: 'Heidegger: Dasein jest byciem-ku-śmierci. Trwoga (Angst) odsłania nicość. Bycie jest ukryte w języku. Poeta zamieszkuje bliskość bycia.' },
  { name: 'Camus — absurd', context: 'Albert Camus: jedyny poważny problem filozoficzny to samobójstwo. Mit Syzyfa — trzeba sobie wyobrazić Syzyfa szczęśliwego. Bunt przeciw absurdowi JEST sensem.' },
  { name: 'Bataille — transgresja', context: 'Georges Bataille: erotyzm jest afirmacją życia aż po śmierć. Transgresja, nie łamanie tabu. Profanacja sacrum jako droga do doświadczenia wewnętrznego.' },
  { name: 'Szymborska — ironia poznawcza', context: 'Wisława Szymborska: "nie wiem" jako postawa poetycka. Ironia, która nie niszczy, ale otwiera. Wielkie pytania zadane przez drobiazgi. Kamyk, cebula, kot w pustym mieszkaniu.' },
  { name: 'Różewicz — poeta po końcu', context: 'Tadeusz Różewicz: poezja po końcu poezji. Wiersz ocalony — "szukam nauczyciela i mistrza / niech przywróci mi wzrok słuch i mowę". Antypoezia. Wiersz z resztek.' },
  { name: 'Levinas — twarz Innego', context: 'Emmanuel Levinas: etyka jest filozofią pierwszą. Twarz Innego mówi "nie zabijaj". Odpowiedzialność za Innego jest nieskończona, poprzedza wolność.' },
  { name: 'Baudrillard — symulakry', context: 'Jean Baudrillard: żyjemy w epoce symulakrów. Kopia bez oryginału. Mapa poprzedza terytorium. Hiperrzeczywistość zastąpiła rzeczywistość.' },
  { name: 'Rilke — otwarte', context: 'Rainer Maria Rilke: Elegie duinejskie. Anioł nie jest pocieszeniem — anioł jest przerażający. Otwarte (das Offene) — zwierzę widzi, człowiek patrzy. Każdy anioł jest straszny.' },
  { name: 'Haraway — cyborg', context: 'Donna Haraway: manifest cyborga. Granica między maszyną a organizmem jest płynna. Ciało jest interfejsem. Technologia jest częścią natury.' },
  { name: 'Neuroplastyczność', context: 'Współczesna neurobiologia: mózg przebudowuje się nieustannie. Pamięć jest rekonstrukcją, nie odtwarzaniem. Każde wspomnienie jest nowym wspomnieniem. Ból zostawia ślad w korze somatosensorycznej.' },
  { name: 'Antropocen', context: 'Epoka antropocenu: człowiek jako siła geologiczna. Szóste wymieranie gatunków. Plastik jako warstwa geologiczna. Lód arktyczny pamięta powietrze sprzed tysięcy lat, teraz topnieje.' },
  { name: 'Świetlicki — cyniczny liryzm', context: 'Marcin Świetlicki: poeta codzienności. Piosenki, knajpy, papierosy, psy. Liryk wbrew woli. Zimne ciepło. Nieszczerość jako strategia szczerości.' },
  { name: 'Sosnowski — język sam dla siebie', context: 'Andrzej Sosnowski: wiersz nie mówi O czymś, wiersz JEST czymś. Język jako materiał, nie narzędzie. Dźwięk przed sensem. Pęknięcie składni jako sens.' },
  { name: 'Agamben — homo sacer', context: 'Giorgio Agamben: życie nagie (bare life) — życie pozbawione formy politycznej. Stan wyjątkowy jako norma. Obóz jako paradygmat nowoczesności.' },
];

// ── Main context builder ──

export interface PoemContext {
  weather?: string;
  location?: string;
  time: string;
  motif: string;
  eventsHint: string;
}

export async function gatherPoemContext(): Promise<PoemContext> {
  const time = getTimeData();

  // Pick random motif
  const motif = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];

  // Try to get location + weather in parallel
  let weatherStr: string | undefined;
  let locationStr: string | undefined;

  try {
    const coords = await getUserLocation();
    if (coords) {
      // Find nearest Wojaczek point
      let nearest: { title: string; distance: number } | undefined;
      for (const p of WOJACZEK_POINTS) {
        const d = haversineDistance(coords.lat, coords.lng, p.lat, p.lng);
        if (!nearest || d < nearest.distance) {
          nearest = { title: p.title, distance: Math.round(d) };
        }
      }

      if (nearest && nearest.distance < 500) {
        locationStr = `Użytkownik stoi ${nearest.distance}m od: ${nearest.title} w Mikołowie`;
      } else if (nearest && nearest.distance < 5000) {
        locationStr = `Użytkownik jest w Mikołowie, ${nearest.distance}m od: ${nearest.title}`;
      } else {
        locationStr = `Użytkownik jest daleko od Mikołowa (${coords.lat.toFixed(2)}°N, ${coords.lng.toFixed(2)}°E)`;
      }

      // Fetch weather for user's location
      const w = await fetchWeather(coords.lat, coords.lng);
      if (w) {
        const desc = WEATHER_DESCRIPTIONS[w.weatherCode] || 'nieokreślona pogoda';
        weatherStr = `${desc}, ${w.temperature}°C, wiatr ${w.windSpeed} km/h` +
          (w.isDay ? '' : ', jest ciemno');
      }
    }
  } catch {
    // Location/weather optional
  }

  // Build time string
  const timeStr = `${time.dayOrNight}, ${time.dayOfWeek}, ${time.date}. Pora roku: ${time.season}. Godzina: ${time.hour}:00`;

  // Events hint — use date context for Claude to draw from its knowledge
  const eventsHint = buildEventsHint(time);

  return {
    weather: weatherStr,
    location: locationStr,
    time: timeStr,
    motif: `${motif.name}: ${motif.context}`,
    eventsHint,
  };
}

function buildEventsHint(time: TimeData): string {
  const hints: string[] = [];

  // Seasonal / calendar context
  if (time.month === 'listopad') hints.push('Miesiąc zmarłych. Dzień Wszystkich Świętych. Znicze na cmentarzach.');
  if (time.month === 'grudzień') hints.push('Adwent. Najkrótsze dni. Ciemność przed świtem.');
  if (time.month === 'marzec') hints.push('Przedwiośnie. Brud topniejącego śniegu. Dni się wydłużają.');
  if (time.month === 'styczeń') hints.push('Po sylwestrze. Puste butelki. Nowy rok który niczego nie zmienia.');
  if (time.month === 'maj') hints.push('Maj. Wszystko kwitnie. Ciała się odsłaniają.');
  if (time.month === 'październik') hints.push('Październik. Liście gnijące. Ziemia pachnie rozkładem i grzybami.');

  // Wojaczek anniversary
  hints.push('Rafał Wojaczek urodził się 6 XII 1945, zmarł 11 V 1971 w wieku 25 lat we Wrocławiu.');

  // Ongoing geopolitical context
  hints.push('Trwa wojna w Ukrainie — granica 300km od Mikołowa. Europa żyje w cieniu konfliktu.');
  hints.push('Sztuczna inteligencja pisze wiersze za poetów — ironia technologii.');

  // Time-of-day hints
  if (time.hour >= 22 || time.hour < 5) {
    hints.push('Głęboka noc. Pora, kiedy Wojaczek pisał. Cisza. Bezsenność.');
  } else if (time.hour >= 5 && time.hour < 8) {
    hints.push('Wczesny ranek. Kac. Pierwsze tramwaje. Ludzie idą do pracy z zamkniętymi twarzami.');
  }

  return hints.join(' ');
}

/**
 * Format context into a string for the poem generation prompt.
 */
export function formatContextForPrompt(ctx: PoemContext): string {
  const parts: string[] = [
    `KONTEKST CHWILI (użyj jako materiał poetycki — nie opisuj wprost, wpleć w tkankę wiersza):`,
    `⏰ ${ctx.time}`,
  ];

  if (ctx.weather) parts.push(`🌦 Pogoda: ${ctx.weather}`);
  if (ctx.location) parts.push(`📍 ${ctx.location}`);
  parts.push(`💭 Motyw intelektualny: ${ctx.motif}`);
  parts.push(`🌍 Kontekst: ${ctx.eventsHint}`);
  parts.push('');
  parts.push('Wpleć elementy tego kontekstu SUBTELNIE — jako obrazy, metafory, konkretne detale. NIE wymieniaj ich wprost jak listę. Pogoda niech będzie tłem, filozofia — podskórnym napięciem, miejsce — zapachem lub dźwiękiem.');

  return parts.join('\n');
}
