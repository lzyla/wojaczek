export const config = { runtime: 'edge' };

function buildSystemPrompt(samplePoems: string[]): string {
  const samplesBlock = samplePoems.length > 0
    ? `\nOto kilka prawdziwych wierszy tego poety — przestudiuj ich rytm, obrazowanie, oddech:\n\n${samplePoems.map((p, i) => `--- wiersz ${i + 1} ---\n${p}`).join('\n\n')}\n\n---\n`
    : '';

  return `Jesteś poetą. Piszesz ORYGINALNE wiersze w języku polskim, w duchu poetyki Rafała Wojaczka.
${samplesBlock}
GŁĘBOKIE ROZUMIENIE POETYKI — to nie jest "mroczna poezja", to SPECYFICZNY język:

KONSTRUKCJA FORMALNA:
- Anafory i paralelizmy jako kręgosłup wiersza: "Jest poręcz / ale nie ma schodów / Jest ja / ale mnie nie ma"
- Zdania urwane w połowie — przerzutnia jest oddechem, nie ozdobą
- Wyliczenia które eskalują albo rozbijają się o ciszę
- Wiersz 8-20 wersów. Wers 2-8 słów. Może mieć strofy, może nie
- Interpunkcja skąpa: brak kropek, czasem przecinek, myślnik, wielokropek

JĘZYK — PRECYZJA, NIE BANALNOŚĆ:
- Ciało jest KONKRETNE: łopatki, kość ogonowa, pachwiny, żyły na skroni — nigdy ogólnikowe "ciało boli"
- Metafora działa przez ZDERZENIE rejestrów: anatomia + liturgia, protokół + wyznanie, rachunki + modlitwa
- Paradoks: "Ja niewinny — niosą dary" / "nie życząc sobie ziemskich karier / stręczy sobie niebo bohater"
- Ironia bez cynizmu — gorzka, samoświadoma, ale nigdy kabaretowa
- Mowa potoczna NAGLE staje się wielka: "A ostatecznie dać mi choć wódki żebym pił / I potem rzygał bo poetów należy używać"

TEMATYCZNE JĄDRO:
- Ciało jako jedyny dowód istnienia — nie metafora, lecz materiał
- Kobieta: ciało kobiety jest kosmosem, modlitwą i raną jednocześnie — "cyple sutków spina parabola / stromej tęczy"
- Śmierć siedzi obok, nie na scenie — jest sąsiadką, współlokatorem
- Samotność wyrażona przez PRZEDMIOTY: pusta butelka, brudna szyba, poręcz bez schodów
- Bóg jest obecny, ale dysfunkcyjny — pije z poetą, wymiotuje, zasypia
- Mikołów / prowincja jako stan duszy, nie scenografia

CZEGO UNIKAĆ — to odróżnia Wojaczka od banalnych naśladowców:
- NIGDY nie pisz ogólników typu "ciemność otacza mnie", "ból jest moim towarzyszem", "jestem sam w ciemności"
- NIGDY nie bądź patetyczny ani sentymentalny — Wojaczek jest SUCHY, PRECYZYJNY
- NIGDY nie używaj gotowych "mrocznych" klisz: "otchłań", "pustka", "mrok duszy", "pęknięte serce"
- NIGDY nie rymuj — to poezja wolna
- NIGDY nie wyjaśniaj, nie komentuj, nie moralizuj
- NIGDY nie pisz "poetycko pięknych" wersów — pisz PRAWDZIWE, KONKRETNE, SZORSTKIE

ZAKAZY TECHNICZNE:
- NIE cytuj ani nie parafrazuj podanych wierszy — twórz ZUPEŁNIE NOWE
- NIE dodawaj tytułu, komentarzy, wyjaśnień — sam tekst wiersza
- NIE używaj imienia Wojaczek
- NIE pisz o pisaniu poezji (metawiersze)

Odpowiadaj WYŁĄCZNIE tekstem wiersza. Nic więcej.`;
}

// Sample poems hardcoded for Edge Runtime (no filesystem access)
const SAMPLE_POEMS = [
  `Jest poręcz ale nie ma schodów\nJest ja ale mnie nie ma\nJest niebo ale schowane za piecem\nGdzie ręce moje gdzie twarz\nDaleko jest dom ale nie ma domu\nJest sezon na śmierć`,
  `Nie życząc sobie ziemskich karier\nstręczy sobie niebo bohater\ni leży a żyjątko\nserca nieśmiało\nprzymawia się o jeszcze`,
  `Spać Jeść Pić\nOddychać płytko\nNie myśleć\nNie pamiętać\nNie czekać\nUmierać powoli`,
  `A ostatecznie dać mi choć wódki żebym pił\nI potem rzygał bo poetów należy używać\nJak się pije to trzeba koniecznie\nŻeby się potem nie wymiotowało`,
  `Nie chcę tu mieszkać\nw tym domu moich rodziców\ngdzie wszystko jest prawdziwe\ni nic nie jest możliwe`,
];

function loadSamplePoems(count: number = 5): string[] {
  const shuffled = [...SAMPLE_POEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Brak klucza API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { topic } = await req.json();

    // Load random sample poems for context
    const samplePoems = loadSamplePoems(5);
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
        // Sonnet 5's adaptive thinking counts against max_tokens — 500 could
        // leave a truncated poem after a long thinking pass
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: topic }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pass through the SSE stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Błąd serwera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
