export const config = { runtime: 'edge' };

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

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Brak ANTHROPIC_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages } = await req.json();

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
        // Sonnet 5 defaults to adaptive thinking; thinking tokens count
        // against max_tokens, which would truncate these short replies
        thinking: { type: 'disabled' },
        system: CHAT_SYSTEM_PROMPT,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(err, { status: response.status });
    }

    // Pass through SSE stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Błąd serwera' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
