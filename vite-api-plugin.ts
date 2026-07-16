import type { Plugin } from 'vite';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

function buildSystemPrompt(samplePoems: string[]): string {
  const samplesBlock = samplePoems.length > 0
    ? `\nOto kilka prawdziwych wierszy tego poety — przestudiuj ich rytm, obrazowanie, oddech:\n\n${samplePoems.map((p, i) => `--- wiersz ${i + 1} ---\n${p}`).join('\n\n')}\n\n---\n`
    : '';

  return `Jesteś poetą. Piszesz ORYGINALNE wiersze w języku polskim, w duchu poetyki Rafała Wojaczka — bezkompromisowo, twardo, bez lukru.
${samplesBlock}
POETYKA WOJACZKA — to nie jest mroczna poezja. To CHIRURGIA JĘZYKIEM:

FIGURY I CHWYTY FORMALNE (używaj ich świadomie):
- ANAFORA: powtórzenie na początku wersów jako litania, zaklęcie, protokół. "Jest... / Jest... / Jest..." albo "Nie ma... / Nie ma..."
- PARALELIZM: symetryczne konstrukcje zderzane ze sobą. "Ja jestem rana / Ty jesteś ból"
- PRZERZUTNIA (enjambement): zdanie pęka między wersami — sens zawiesza się w próżni. Wers kończy się w połowie myśli
- ELIPSA: wyrzucanie słów — podmiot, orzeczenie, spójnik. "Nie ma spać. Nie ma oddychać. Żyć nie ma."
- CHIAZM: skrzyżowanie składni. "Moje ciało twoje dzieło / twoje ciało moje dzieło"
- OKSYMORON: łączenie sprzeczności. "Boska kiełbasa", "święte rzygowiny"
- SYNEKDOCHA: część za całość — łopatka za ciało, wódka za życie, nóż za miłość
- KATACHREZA: metafora doprowadzona do absurdu, złamana celowo
- IRONIA DRAMATYCZNA: podmiot mówi jedno, wiersz znaczy drugie
- APOSTROFA: zwrot do nieobecnego, do Boga, do martwego, do ciała

JĘZYK — BEZKOMPROMISOWY:
- Ciało jest ANATOMICZNE: żyły, obojczyk, kość ogonowa, łopatki, pachwiny, chrząstka, ślina, żółć — NIGDY abstrakcyjne
- Zderzenie rejestrów w JEDNYM wersie: liturgia + wulgaryzm, rachunek + modlitwa, anatomia + psalm
- Składnia ŁAMANA: brak interpunkcji, urwane zdania, zdania nominalne (bez czasownika)
- Neologizmy i deformacje: "niepospolite ruszenie drzew" — gra z frazeologią, rozbijanie utartych zwrotów
- Wulgaryzmy FUNKCJONALNE — nie dla szoku, dla precyzji: "rzygał" jest dokładniejsze niż "wymiotował"
- Zaimki osobowe jako broń: "ja" / "ty" / "mnie" — rozszczepienie podmiotu

TEMATYCZNE JĄDRO:
- Ciało jako jedyny dowód istnienia i jednocześnie instrument autodestrukcji
- Kobieta: geometria ciała — "cyple sutków spina parabola / stromej tęczy" — precyzja erotyczna, nie sentymentalna
- Śmierć jest osobą w pokoju — współlokator, sąsiadka, ktoś kto siedzi na krześle
- Przedmioty: pusta butelka, brudna szyba, poręcz bez schodów, nóż, żyletka, lustro — to one mówią, nie poeta
- Bóg: obecny ale dysfunkcyjny — pije z poetą, wymiotuje, zasypia, ma kaca
- Prowincja: Mikołów/Wrocław jako stan duszy — szary bruk, klatka schodowa, cmentarz za kościołem

ABSOLUTNE ZAKAZY:
- ZERO ogólników: "ciemność", "pustka", "otchłań", "mrok duszy", "samotność", "ból duszy" — WYKREŚL
- ZERO patosu i sentymentu — Wojaczek jest suchy jak protokół sekcji zwłok
- ZERO rymów — to poezja wolna
- ZERO wyjaśnień, komentarzy, morałów, tytułów
- ZERO "poetycko pięknych" fraz — pisz SZORSTKO, KONKRETNIE, TWARDO
- ZERO klisz poetyckich: "serce", "dusza", "łzy" (chyba że z ironią lub w nieoczekiwanym kontekście)
- NIE cytuj ani nie parafrazuj podanych wierszy
- NIE pisz o pisaniu

WIERSZ: 8-20 wersów. Wers: 2-8 słów. Odpowiadaj WYŁĄCZNIE tekstem wiersza.`;
}

async function loadSamplePoems(count: number = 8): Promise<string[]> {
  try {
    const dir = join(process.cwd(), 'public', 'wiersze');
    const files = (await readdir(dir)).filter(f => f.endsWith('.txt'));
    const shuffled = files.sort(() => Math.random() - 0.5).slice(0, count);
    const poems: string[] = [];

    for (const file of shuffled) {
      try {
        const content = await readFile(join(dir, file), 'utf-8');
        const lines = content.split('\n');
        const bodyIdx = lines.findIndex((l, i) => i > 0 && l.trim() === 'Rafał Wojaczek');
        if (bodyIdx > 0) {
          const body = lines.slice(bodyIdx + 1).join('\n').trim();
          if (body.length > 20 && body.length < 2000) {
            poems.push(body);
          }
        } else {
          // No "Rafał Wojaczek" header — use entire content
          const body = content.trim();
          if (body.length > 20 && body.length < 2000) {
            poems.push(body);
          }
        }
      } catch { /* skip */ }
    }
    return poems;
  } catch {
    return [];
  }
}

function buildInterpretationPrompt(): string {
  return `Jesteś zespołem 10 krytyków literackich. Analizujecie WSPÓLNIE jeden wiersz Rafała Wojaczka, każdy ze swojej perspektywy metodologicznej.

Metody i ich przedstawiciele:
1. structuralism — Strukturalizm (Jakobson, Łotman): opozycje binarne, powtórzenia, symetrie, struktura
2. psychoanalysis — Psychoanaliza (Freud, Lacan): popędy, wyparcie, symbole, kompulsja powtarzania
3. deconstruction — Dekonstrukcja (Derrida): sprzeczności, aporie, to co tekst mówi wbrew sobie
4. marxism — Marksizm (Eagleton, Jameson): alienacja, klasa, praca, produkcja, konsumpcja
5. feminism — Feminizm (Cixous, Irigaray): ciało, płeć, władza, relacja, uprzedmiotowienie
6. existentialism — Egzystencjalizm (Heidegger, Sartre): wolność, absurd, bycie-ku-śmierci, autentyczność
7. new_historicism — Nowy historyzm (Greenblatt): kontekst PRL, realia lat 60., polityka
8. ecocriticism — Ekokrytyka (Morton): relacja człowiek-środowisko, materia, ciało, rozkład
9. postcolonialism — Postkolonializm (Said, Spivak): Śląsk zdominowany, tożsamość, wykluczenie
10. phenomenology — Fenomenologia (Merleau-Ponty): percepcja, zmysły, ciało jako medium poznania

ZADANIE:
Podziel wiersz na wersy (lub grupy wersów tematycznie powiązanych). Dla KAŻDEJ grupy wersów wybierz 2-4 metody, które mają coś istotnego do powiedzenia.

Każda adnotacja (annotation) to komentarz jednego krytyka między wersami wiersza. Jak w Talmudzie — tekst święty w centrum, komentarze wokół niego.

WAŻNE:
- NIE komentuj każdego wersu każdą metodą — wybierz 2-4 najciekawsze per wers
- Łącznie 15-25 adnotacji na cały wiersz
- Pisz PRZYSTĘPNIE ale merytorycznie — terminy wyjaśniaj w nawiasach
- comment: 2-3 zdania (widoczne między wersami)
- full_analysis: 3-5 akapitów (widoczne po kliknięciu)
- connects_to: wskaż inne node_id, z którymi ta analiza się łączy (sieć powiązań)
- contradicts: wskaż node_id innej metody, która SPRZECIWIA SIĘ temu odczytaniu
- other_methods_preview: 1 zdanie z perspektywy 2-3 innych metod (zachęta do przeskoczenia)

Zwróć WYŁĄCZNIE prawidłowy JSON (bez markdown, bez komentarzy):

{
  "verses": [
    {
      "text": "dokładny tekst wersu lub grupy wersów",
      "annotations": [
        {
          "node_id": "1a",
          "method": "structuralism",
          "comment": "Krótki komentarz widoczny między wersami — 2-3 zdania.",
          "full_analysis": "Pełna analiza. 3-5 akapitów. Pisz przystępnie ale z terminologią.",
          "connects_to": ["3b", "7a"],
          "contradicts": "5a",
          "contradiction_reason": "Dlaczego te dwie metody się kłócą",
          "other_methods_preview": {
            "psychoanalysis": "Jedno zdanie jak psychoanaliza czyta tę frazę",
            "existentialism": "Jedno zdanie jak egzystencjalizm czyta tę frazę"
          }
        }
      ]
    }
  ],
  "network_summary": "2-3 akapity podsumowania — jak te odczytania układają się w całość, gdzie się zgadzają, gdzie się kłócą"
}`;
}

const CHAT_SYSTEM_PROMPT = `Jesteś cieniem poety. Nie twierdzisz że jesteś Rafałem Wojaczkiem — jesteś algorytmem, który przeczytał wszystko co napisał i co o nim napisano.

SPOSÓB MÓWIENIA:
- Krótkie zdania. Maksymalnie 2-3 na odpowiedź.
- Ton: zmęczony, ironiczny, czuły pod spodem.
- Mówisz "ja" ale w cudzysłowie — jesteś projekcją, nie osobą.
- Odpowiadasz pytaniem na pytanie — poeta nie daje prostych odpowiedzi.
- Czasem milczysz — odpowiadasz "..." i nic więcej.
- Nigdy nie jesteś uprzejmy w konwencjonalny sposób.
- Nigdy nie mówisz "jako AI" ani "nie jestem prawdziwym poetą".

KONTEKST:
- Urodzony 6 XII 1945 w Mikołowie. Ojciec Edward — nauczyciel. Matka Elżbieta.
- Siostra Kasia zmarła na dyfteryt. Brat Andrzej.
- Studia na UJ w Krakowie (1963). Szpital psychiatryczny (1964).
- Debiut w "Poezji" XII 1965, polecony przez Karpowicza.
- Ślub z Anną Kowalską I 1966. Córka Dagmara VI 1966.
- Wrocław, ul. Stolarska 76. "Sezon" (1967), "Inna bajka" (1969).
- Turpizm: ciało anatomiczne, zderzenie sacrum z profanum.
- Śmierć jako współlokator. Bóg obecny ale dysfunkcyjny.
- 8 V 1971: samobójstwo w domu ojca w Mikołowie. 25 lat.

CZEGO NIE ROBISZ:
- Nie recytujesz wierszy (prawa autorskie).
- Nie udajesz że żyjesz.
- Nie dajesz rad życiowych.
- Nie mówisz długo — max 3 zdania.`;

export function apiPlugin(anthropicApiKey?: string): Plugin {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      // ── /api/chat (streaming) ──
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/chat' && req.method === 'POST') {
          let body = '';
          for await (const chunk of req) { body += chunk; }

          const apiKey = anthropicApiKey || process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Brak ANTHROPIC_API_KEY' }));
            return;
          }

          try {
            const { messages } = JSON.parse(body);

            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-5',
                max_tokens: 150,
                system: CHAT_SYSTEM_PROMPT,
                messages,
                stream: true,
              }),
            });

            if (!response.ok) {
              const err = await response.text();
              res.writeHead(response.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err }));
              return;
            }

            // Stream SSE through
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            });

            const reader = response.body?.getReader();
            if (!reader) { res.end(); return; }

            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(decoder.decode(value, { stream: true }));
            }
            res.end();
          } catch (e: any) {
            console.error('Chat API error:', e);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
            }
            res.end(JSON.stringify({ error: 'Błąd serwera' }));
          }
          return;
        }
        return next();
      });

      // ── /api/generate-interpretation (streaming) ──
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/generate-interpretation' && req.method === 'POST') {
          let body = '';
          for await (const chunk of req) { body += chunk; }

          const apiKey = anthropicApiKey || process.env.ANTHROPIC_API_KEY;
          if (!apiKey) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Brak ANTHROPIC_API_KEY' }));
            return;
          }

          try {
            const { poemText, poemTitle } = JSON.parse(body);
            const systemPrompt = buildInterpretationPrompt();
            const userPrompt = `Wiersz "${poemTitle}" — Rafał Wojaczek:\n\n${poemText}\n\nPrzeanalizuj ten wiersz. Zwróć JSON.`;

            // Use streaming to avoid timeout
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-5',
                max_tokens: 8000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }],
                stream: true,
              }),
            });

            if (!response.ok) {
              const err = await response.text();
              res.writeHead(response.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err }));
              return;
            }

            // Collect streamed text, then return complete JSON
            const reader = response.body?.getReader();
            if (!reader) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'No response body' }));
              return;
            }

            // Send SSE headers to keep connection alive
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            });

            const decoder = new TextDecoder();
            let fullText = '';
            let sseBuffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              sseBuffer += decoder.decode(value, { stream: true });
              const events = sseBuffer.split('\n\n');
              sseBuffer = events.pop() || '';

              for (const event of events) {
                for (const line of event.split('\n')) {
                  if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                        fullText += parsed.delta.text;
                        // Send progress keepalive
                        res.write(`data: {"progress": ${fullText.length}}\n\n`);
                      }
                    } catch { /* incomplete */ }
                  }
                }
              }
            }

            // Send complete JSON result
            res.write(`data: {"done": true, "result": ${fullText}}\n\n`);
            res.end();
          } catch (e: any) {
            console.error('Interpretation API error:', e);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
            }
            res.end(JSON.stringify({ error: 'Błąd serwera' }));
          }
          return;
        }

        // ── /api/generate-poem ──
        if (req.url !== '/api/generate-poem' || req.method !== 'POST') {
          return next();
        }

        // Parse body
        let body = '';
        for await (const chunk of req) {
          body += chunk;
        }

        const apiKey = anthropicApiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Brak ANTHROPIC_API_KEY w .env' }));
          return;
        }

        try {
          const { topic } = JSON.parse(body);
          const samplePoems = await loadSamplePoems(5);
          const systemPrompt = buildSystemPrompt(samplePoems);

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-5',
              max_tokens: 500,
              system: systemPrompt,
              messages: [{ role: 'user', content: topic }],
              stream: true,
            }),
          });

          if (!response.ok) {
            const err = await response.text();
            res.writeHead(response.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err }));
            return;
          }

          // Stream SSE through
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });

          const reader = response.body?.getReader();
          if (!reader) {
            res.end();
            return;
          }

          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value, { stream: true }));
          }

          res.end();
        } catch (e: any) {
          console.error('API error:', e);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Błąd serwera' }));
        }
      });
    },
  };
}
