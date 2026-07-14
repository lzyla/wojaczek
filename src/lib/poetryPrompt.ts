export const TOPIC_PROMPTS: Record<string, string> = {
  cialo: 'Napisz wiersz w którym ciało jest atlasem — konkretne części ciała (łopatki, obojczyk, pachwiny, żyły na skroni) stają się krajobrazem. Ciało kobiety albo własne ciało. Precyzja anatomiczna spleciona z metafizyką. Żadnych ogólników.',
  smierc: 'Napisz wiersz w którym śmierć jest OBECNA jak współlokator, sąsiadka, ktoś kto siedzi na krześle i czeka. Nie abstrakcja, nie symbol — osoba. Użyj konkretu: meble, godziny, czynności codzienne. Ironia. Paradoks.',
  mikolow: 'Napisz wiersz-wyliczenie o małym mieście. Użyj anafor: "Jest..." / "Nie ma...". Konkretne przedmioty i miejsca: poręcz, klatka schodowa, brudne szyby baru, cmentarz za kościołem. Ludzie bez twarzy. Mokro. Szaro. Ale w środku — nagłe pęknięcie piękna.',
  milosc: 'Napisz wiersz erotyczny — ciało kobiety jako kosmografia: cyple sutków, parabola bioder, perspektywa łydki. Pożądanie jest głodem, modlitwą i raną. Precyzyjny, zmysłowy, ostry. Żadnej sentymentalności.',
  losowy: 'Napisz wiersz. Użyj anafor albo paralelizmów. Zderzaj rejestry: anatomia z liturgią, protokół z wyznaniem, rachunki z modlitwą. Konkretne przedmioty. Paradoksy. Ironia. Brak patosu. Brak klisz. Szorstkość.',
};

export type TopicKey = keyof typeof TOPIC_PROMPTS;
