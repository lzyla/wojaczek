import type { PoemNetwork, InterpretationPoem } from '../types';

// ── Poems available for interpretation ──
export const INTERPRETATION_POEMS: InterpretationPoem[] = [
  {
    id: 'sezon',
    title: 'Sezon',
    content: `Jest poręcz
ale nie ma schodów
Jest ja
ale mnie nie ma
Jest zimno
ale nie ma ciepłych skór zwierząt
niedźwiedzich futer lisich kit
Od czasu kiedy jest mokro
jest bardzo mokro
ja kocha mokro
na placu, bez parasola
Jest ciemno
jest ciemno jak najciemniej
mnie nie ma
Nie ma spać
Nie ma oddychać
Żyć nie ma
Tylko drzewa się ruszają
niepospolite ruszenie drzew
rodzą czarnego kota
który przebiega wszystkie drogi`,
    year: '1965',
    file: 'sezon.txt',
  },
  {
    id: 'krzyz',
    title: 'Krzyż',
    content: `Ja jestem pozioma
Ty jesteś pionowy
Ty jesteś góra
Ja jestem dolina
Ja jestem Ziemia
Ty jesteś Słońce
Ja jestem tarcza
Ty jesteś miecz
Ja jestem rana
Ty jesteś ból
Ja jestem noc
Ty jesteś Bóg
Ty jesteś ogień
Ja jestem woda
Ja jestem naga
Ty jesteś we mnie
Ja jestem pozioma
Ale nie zawsze
Ty jesteś pionowy
Ale do czasu
Ja jestem pionowa
Góra orgazmu
Ty jesteś pionowy
Przy mnie`,
    year: '1966',
    file: 'krzyz.txt',
  },
  {
    id: 'prosba',
    title: 'Prośba',
    content: `Dać mi miotłę bym zamiótł publiczny plac
Albo kobietę bym ją kochał i zapładniał
Dać mi ojczyznę bym opiewał
Pejzaż lub ustrój lżył czy chwalił rząd
Przedstawić mi człowieka bym ujrzał jego wielkość
Czy nędzę i opisał w ciekawych słowach
Wskazać mi zakochanych bym się wzruszył
Posłać mnie do szpitala. Na komunalny cmentarz
Urządzić mi teatr igrzyska sportowe
Wojnę żniwa we wsi festyn w mieście
Albo nauczyć mnie prowadzić samochód pisać na maszynie
Zmusić do nauki języków czytania gazet
A ostatecznie dać mi choć wódki żebym pił
I potem rzygał bo poetów należy używać`,
    year: '1966',
    file: 'prosba.txt',
  },
  {
    id: 'reszta-krwi',
    title: 'Reszta krwi',
    content: `Widzisz
to jest Ziemia
Wygląda jak gwiazda
na dnie
łzy
Moja kochana nie wiem
co tam świeci, to pewnie
boża krówka
Mój kochany powiem:
to reszta naszej krwi
glob
prześwieca`,
    year: '1967',
    file: 'reszta-krwi.txt',
  },
];

// ── Cache ──
const networkCache = new Map<string, PoemNetwork>();

// ── Load pre-generated interpretation from static JSON ──
export async function loadInterpretation(poemId: string): Promise<PoemNetwork> {
  // Check cache first
  const cached = networkCache.get(poemId);
  if (cached) return cached;

  // Load pre-generated static JSON
  const response = await fetch(`/interpretations/${poemId}.json`);
  if (!response.ok) {
    throw new Error('Interpretacja niedostępna');
  }

  const data = await response.json();
  const network: PoemNetwork = {
    poem_id: poemId,
    verses: data.verses || [],
    network_summary: data.network_summary || '',
  };

  // Cache it
  networkCache.set(poemId, network);
  return network;
}

export function getCachedNetwork(poemId: string): PoemNetwork | undefined {
  return networkCache.get(poemId);
}
