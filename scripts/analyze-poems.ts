import * as fs from "fs";
import * as path from "path";

// ── Polish stopwords ──────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  // spójniki, przyimki, partykuły
  "i","w","z","na","do","nie","to","się","że","jak","co","jest","za","o","ale",
  "od","po","tak","już","czy","go","ten","być","tego","ja","ty","mi","mnie","ci",
  "cię","mu","je","ich","jej","nas","was","im","tam","tu","on","ona","ono","my",
  "wy","oni","one","ta","te","które","który","która","tym","tych","by","ze","a",
  "bo","lub","ni","więc","są","ma","mam","był","była","było","byli","będzie",
  "mogę","może","swój","sobie","jego","mój","twój","gdy","tylko","jeszcze","już",
  "przy","nad","pod","przed","bez","dla","jako","albo","ani","tę","tą","też",
  // rozszerzone polskie stopwords
  "lecz","przez","choć","chociaż","nawet","kiedy","wtedy","znów","wciąż",
  "aż","gdzie","jakby","wreszcie","także","oraz","jednak","więc","zaś",
  "bowiem","gdyż","ponieważ","jeśli","jeżeli","czy","oto","ów","owa","owe",
  "jestem","jesteś","jest","jesteśmy","jesteście","będę","będziesz",
  "wiem","wie","wiemy","można","trzeba","niech","niechaj",
  "tego","temu","tą","tę","tych","tymi","owych","owym",
  "moje","moja","moim","moich","mojego","mojej","mojemu","moją",
  "twoje","twoja","twoim","twoich","twojego","twojej","twoją",
  "swoje","swoja","swoim","swoich","swojego","swojej","swoją",
  "jej","jego","ich","nasz","nasza","nasze","naszym","naszych",
  "nam","wam","nim","niej","nią","nimi","niego","niemu",
  "mną","tobą","sobą","ją","jemu",
  "kto","ktoś","coś","czegoś","kogoś","komuś","czymś","kimś",
  "tej","ten","tego","temu","tamten","tamta","tamto",
  "sam","sama","samo","sami","same",
  "tu","tam","teraz","potem","zatem","stąd","stamtąd","dokąd","skąd",
  "no","hej","ach","och","ej","ha","he","hmm",
  // dodatkowe function words
  "przecież","we","tyle","żeby","aby","gdyby","dopiero","właśnie",
  "nigdy","niczego","nikogo","nikomu","nigdzie","żadne","żadnej","żadnego",
  "bądź","chyba","pewnie","może","raczej","prawie","dosyć","dość",
  "bardzo","trochę","nieco","całkiem","zupełnie","naprawdę",
  "każdy","każda","każde","każdym","każdej","każdego",
  "wszystko","wszystkie","wszystkim","wszystkich","wszystkiego",
  "cały","cała","całe","całym","całej","całego",
  "inny","inna","inne","innym","innej","innego","innych",
  "swego","swych","swe","swej",
  // gwiazdki i znaki
  "*","**","***","—","–",
]);

// ── Semantic field dictionaries ───────────────────────────────────────────────
const SEMANTIC_FIELDS: Record<string, Set<string>> = {
  cialo: new Set([
    "ciało","ręce","ręka","dłonie","dłoń","oczy","oko","usta","skóra","krew",
    "kości","kość","włosy","brzuch","serce","pierś","piersi","palce","palec",
    "nogi","noga","głowa","twarz","żyły","łopatki","pachwiny","kolana","stopy",
    "ramiona","plecy","bark","obojczyk","biodra","łydki","sutek","sutki",
    "język","zęby","gardło","żebra","karku","kark","mięso","tętno","pot",
    "łzy","ślina","mocz","nasienie","warga","wargi","powieka","powieki",
    "brzuch","żołądek","trzewia","jelita","krtań","tchawica",
  ]),
  smierc: new Set([
    "śmierć","umrzeć","umierać","grób","trup","zabić","zabijać","pogrzeb",
    "koniec","konać","martwy","umarł","umarły","zgon","krew","rana","rany",
    "samobójstwo","wisieć","sznur","nóż","brzytwa","trucizna","topić",
    "dusić","ciąć","cięcie","krwawić","krwawienie","śmiertelny","grobu",
    "cmentarz","trumna","mogiła","nekrolog","żałoba",
  ]),
  erotyka: new Set([
    "kochać","kochanie","miłość","pożądanie","pragnienie","całować",
    "pocałunek","objąć","łóżko","nagi","naga","nagie","srom","łono",
    "spółkować","rozkoszy","rozkosz","orgazm","spazm","sperma","wagina",
    "dotyk","dotykać","pieścić","pieszczota","gorący","mokra","mokry",
    "udo","uda","biodro","biodra","pierś","sutki","sutek",
  ]),
  alkohol: new Set([
    "wódka","wino","piwo","pić","pił","piję","pijany","pijaństwo",
    "butelka","kieliszek","szklanka","bar","knajpa","kac","rzygać",
    "wymiotować","upić","upity","deliryczny","delirium","spirytus",
  ]),
  samotnosc: new Set([
    "sam","sama","samo","samotny","samotność","samotnie","pusty","pustka",
    "cicho","cisza","milczenie","milczeć","nikt","opuszczony","porzucony",
    "zostawić","zostawiony","odejść","odchodzić","znikać","nieobecność",
    "bezdomny","tułacz","wygnanie","wygnany","obcy","brak",
  ]),
  sacrum: new Set([
    "bóg","modlitwa","kościół","anioł","grzech","zbawienie","niebo","piekło",
    "diabeł","krzyż","dusza","święty","msza","kapłan","modlić",
    "chrystus","madonna","hostia","komunia","spowiedź","grzeszny",
    "bluźnierstwo","zbawiciel","odkupienie","ofiara","rytuał",
  ]),
  noc: new Set([
    "noc","nocą","nocny","ciemność","ciemno","mrok","mroczny","sen","śnić",
    "senny","bezsenność","koszmar","księżyc","gwiazdy","zmierzch","świt",
    "wieczór","wieczorem","zmrok","latarnia","cień","cienie",
  ]),
  bol: new Set([
    "ból","boleć","cierpieć","cierpienie","męka","krzyk","krzyczeć",
    "płakać","łzy","szloch","wrzask","wyć","skowyt","tortura","drżeć",
    "drżenie","konwulsje","skurcz","rwanie","palenie","piekący","ostry",
  ]),
};

// ── Pronoun form dictionaries ─────────────────────────────────────────────────
const PRONOUN_FORMS: Record<string, Set<string>> = {
  ja: new Set([
    "ja","mnie","mi","mną","me","mój","moja","moje","moim","moich","mojego","mojej",
  ]),
  ty: new Set([
    "ty","ciebie","cię","ci","tobą","twój","twoja","twoje","twoim","twoich","twojego","twojej",
  ]),
  on_ona: new Set([
    "on","ona","ono","go","mu","nim","niej","jego","jej","ich","je",
  ]),
  my: new Set(["my","nas","nam","nami","nasz","nasza","nasze","naszym","naszych"]),
  wy: new Set(["wy","was","wam","wami","wasz","wasza","wasze"]),
  oni: new Set(["oni","one","ich","im","nimi"]),
};

// ── Negation words ────────────────────────────────────────────────────────────
const NEGATION_WORDS = new Set([
  "nie","nic","nikt","nigdy","nigdzie","żaden","żadna","żadne","bez","brak",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip punctuation from a word for counting purposes. */
function stripPunctuation(word: string): string {
  return word.replace(/[.,;:!?"""''„"«»()[\]{}<>…–—\-\/\\]/g, "");
}

/** Parse a poem text file into title and body lines. */
function parsePoem(raw: string): { title: string; bodyLines: string[] } {
  const lines = raw.split(/\r?\n/);

  // Title is the first non-empty line
  const title = (lines[0] || "").trim();

  // Find the start of the body: skip title, blank line, author line, blank line
  // Then also skip a duplicate uppercase title line if present
  let bodyStart = 0;
  for (let i = 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === "Rafał Wojaczek" || trimmed === "") continue;
    bodyStart = i;
    break;
  }

  // If the first body line is an uppercase version of the title, skip it
  if (
    bodyStart < lines.length &&
    lines[bodyStart].trim().toUpperCase() === lines[bodyStart].trim() &&
    lines[bodyStart].trim().toLowerCase() === title.toLowerCase()
  ) {
    bodyStart++;
  }

  // Collect body lines, trimming trailing empty lines
  let bodyLines = lines.slice(bodyStart);

  // Remove trailing empty lines
  while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
    bodyLines.pop();
  }

  // Remove trailing date line if it matches common date patterns
  if (bodyLines.length > 0) {
    const lastLine = bodyLines[bodyLines.length - 1].trim();
    // Patterns like "1968", "27/28 III 66", "13 maja 1967", "III 1966", etc.
    if (/^\d{4}$/.test(lastLine) ||
        /^\d{1,2}[\s\/]\w+[\s\/]\d{2,4}$/.test(lastLine) ||
        /^[IVXLC]+\s+\d{2,4}$/.test(lastLine) ||
        /^\d{1,2}\s+\w+\s+\d{4}$/.test(lastLine) ||
        /^\d{1,2}\/\d{1,2}\s+[IVXLC]+\s+\d{2,4}$/.test(lastLine)) {
      bodyLines.pop();
    }
  }

  // Remove trailing empty lines again after date removal
  while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
    bodyLines.pop();
  }

  return { title, bodyLines };
}

/** Clean poem title: remove asterisks and parentheses */
function cleanTitle(title: string): string {
  let t = title.trim();
  // Remove leading "* * *" or similar
  t = t.replace(/^\*[\s*]*/, '').trim();
  // Remove wrapping parentheses
  t = t.replace(/^\((.+)\)\s*$/, '$1').trim();
  return t || 'Bez tytułu';
}

/** Tokenize a line into lowercase words with punctuation stripped. */
function tokenize(line: string): string[] {
  return line
    .split(/\s+/)
    .map((w) => stripPunctuation(w.toLowerCase()))
    .filter((w) => w.length > 0);
}

/** Count punctuation occurrences in raw text. */
function countPunctuation(text: string) {
  return {
    comma: (text.match(/,/g) || []).length,
    period: (text.match(/\./g) || []).length,
    question: (text.match(/\?/g) || []).length,
    exclamation: (text.match(/!/g) || []).length,
    ellipsis: (text.match(/\.\.\./g) || []).length + (text.match(/…/g) || []).length,
    dash: (text.match(/[–—-]/g) || []).length,
    colon: (text.match(/:/g) || []).length,
    semicolon: (text.match(/;/g) || []).length,
  };
}

// ── Per-poem analysis ─────────────────────────────────────────────────────────

interface PoemAnalysis {
  id: string;
  title: string;
  wordCount: number;
  lineCount: number;
  uniqueWords: number;
  vocabularyRichness: number;
  avgWordsPerLine: number;
  wordsPerLineDistribution: number[];
  wordFrequencies: [string, number][];
  punctuation: ReturnType<typeof countPunctuation>;
  questionCount: number;
  exclamationCount: number;
  negationCount: number;
  negationWords: string[];
  pronounDistribution: Record<string, number>;
  semanticFields: Record<string, number>;
  // New
  anaphors: [string, number][];
  firstWord: string;
  lastWord: string;
  avgWordLength: number;
  wordLengthDistribution: Record<string, number>;
  bigrams: [string, number][];
  poemWords: string[];
}

function analyzePoem(filename: string, raw: string): PoemAnalysis {
  const id = path.basename(filename, ".txt");
  const { title: rawTitle, bodyLines } = parsePoem(raw);
  const title = cleanTitle(rawTitle);

  // Filter out empty lines for word counting but keep them for line count
  const nonEmptyLines = bodyLines.filter((l) => l.trim().length > 0);
  const lineCount = nonEmptyLines.length;

  // Tokenize all lines
  const allWords: string[] = [];
  const wordsPerLineDistribution: number[] = [];

  for (const line of nonEmptyLines) {
    const tokens = tokenize(line);
    wordsPerLineDistribution.push(tokens.length);
    allWords.push(...tokens);
  }

  const wordCount = allWords.length;
  const uniqueWordsSet = new Set(allWords);
  const uniqueWords = uniqueWordsSet.size;
  const vocabularyRichness = wordCount > 0 ? +(uniqueWords / wordCount).toFixed(3) : 0;
  const avgWordsPerLine = lineCount > 0 ? +(wordCount / lineCount).toFixed(2) : 0;

  // Word frequencies (no stopwords), top 20
  const freqMap = new Map<string, number>();
  for (const w of allWords) {
    if (!STOPWORDS.has(w)) {
      freqMap.set(w, (freqMap.get(w) || 0) + 1);
    }
  }
  const wordFrequencies: [string, number][] = [...freqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // Punctuation from raw body text
  const bodyText = bodyLines.join("\n");
  const punctuation = countPunctuation(bodyText);
  // Correct period count: subtract ellipsis dots already counted
  const ellipsisThreeDot = (bodyText.match(/\.\.\./g) || []).length;
  punctuation.period = Math.max(0, punctuation.period - ellipsisThreeDot * 3);

  const questionCount = punctuation.question;
  const exclamationCount = punctuation.exclamation;

  // Negation
  const foundNegations = new Set<string>();
  let negationCount = 0;
  for (const w of allWords) {
    if (NEGATION_WORDS.has(w)) {
      negationCount++;
      foundNegations.add(w);
    }
  }

  // Pronouns
  const pronounDistribution: Record<string, number> = {
    ja: 0, ty: 0, on_ona: 0, my: 0, wy: 0, oni: 0,
  };
  for (const w of allWords) {
    for (const [category, forms] of Object.entries(PRONOUN_FORMS)) {
      if (forms.has(w)) {
        pronounDistribution[category]++;
      }
    }
  }

  // Semantic fields
  const semanticFields: Record<string, number> = {};
  for (const field of Object.keys(SEMANTIC_FIELDS)) {
    semanticFields[field] = 0;
  }
  for (const w of allWords) {
    for (const [field, keywords] of Object.entries(SEMANTIC_FIELDS)) {
      if (keywords.has(w)) {
        semanticFields[field]++;
      }
    }
  }

  // ── NEW: Anaphors — first words/phrases of each line ──
  const ANAPHORA_SKIP = new Set(["i","a","w","z","na","do","o","po","za","od","u","we","ze","no","to","że","co","ku"]);
  const lineStarters = new Map<string, number>();
  for (const line of nonEmptyLines) {
    const tokens = tokenize(line);
    // Take first meaningful word, or first two words as phrase
    let starter = '';
    if (tokens.length >= 2 && ANAPHORA_SKIP.has(tokens[0])) {
      starter = `${tokens[0]} ${tokens[1]}`;
    } else if (tokens[0] && !ANAPHORA_SKIP.has(tokens[0])) {
      starter = tokens[0];
    } else if (tokens.length >= 2) {
      starter = tokens[1];
    }
    if (starter) lineStarters.set(starter, (lineStarters.get(starter) || 0) + 1);
  }
  const anaphors: [string, number][] = [...lineStarters.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // ── NEW: First and last words of the poem ──
  const firstWord = allWords.find(w => w !== '*' && w.length > 1) || allWords[0] || '';
  const lastWord = [...allWords].reverse().find(w => w !== '*' && w.length > 1 && !/^\d+$/.test(w)) || allWords[allWords.length - 1] || '';

  // ── NEW: Word length distribution ──
  const wordLengths = allWords.map(w => w.length);
  const avgWordLength = wordLengths.length > 0
    ? +(wordLengths.reduce((s, l) => s + l, 0) / wordLengths.length).toFixed(2) : 0;
  const wordLengthDistribution: Record<string, number> = {};
  for (const len of wordLengths) {
    const bucket = len <= 3 ? '1-3' : len <= 5 ? '4-5' : len <= 7 ? '6-7' : len <= 9 ? '8-9' : '10+';
    wordLengthDistribution[bucket] = (wordLengthDistribution[bucket] || 0) + 1;
  }

  // ── NEW: Bigrams (word pairs) ──
  const bigramMap = new Map<string, number>();
  for (let i = 0; i < allWords.length - 1; i++) {
    const bigram = `${allWords[i]} ${allWords[i + 1]}`;
    bigramMap.set(bigram, (bigramMap.get(bigram) || 0) + 1);
  }
  const bigrams: [string, number][] = [...bigramMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // ── NEW: Co-occurrence (word pairs in same poem) ──
  const poemWordSet = new Set(allWords.filter(w => !STOPWORDS.has(w) && w.length > 2));

  return {
    id,
    title,
    wordCount,
    lineCount,
    uniqueWords,
    vocabularyRichness,
    avgWordsPerLine,
    wordsPerLineDistribution,
    wordFrequencies,
    punctuation,
    questionCount,
    exclamationCount,
    negationCount,
    negationWords: [...foundNegations].sort(),
    pronounDistribution,
    semanticFields,
    // New fields
    anaphors,
    firstWord,
    lastWord,
    avgWordLength,
    wordLengthDistribution,
    bigrams,
    poemWords: [...poemWordSet],
  };
}

// ── Corpus analysis ───────────────────────────────────────────────────────────

interface CorpusAnalysis {
  totalPoems: number;
  totalWords: number;
  totalLines: number;
  avgPoemLength: number;
  medianPoemLength: number;
  poemLengthDistribution: { bucket: string; count: number }[];
  globalWordFrequencies: [string, number][];
  globalVocabularySize: number;
  semanticFieldTotals: Record<string, number>;
  pronounTotals: Record<string, number>;
  negationTotal: number;
  punctuationTotals: Record<string, number>;
  longestPoem: { id: string; title: string; wordCount: number };
  shortestPoem: { id: string; title: string; wordCount: number };
  mostLexicallyRich: { id: string; title: string; ratio: number };
  leastLexicallyRich: { id: string; title: string; ratio: number };
  poemIndex: { id: string; title: string }[];
}

function buildCorpusAnalysis(poems: PoemAnalysis[]): CorpusAnalysis {
  const totalPoems = poems.length;
  const totalWords = poems.reduce((s, p) => s + p.wordCount, 0);
  const totalLines = poems.reduce((s, p) => s + p.lineCount, 0);
  const avgPoemLength = totalPoems > 0 ? +(totalWords / totalPoems).toFixed(1) : 0;

  // Median
  const sorted = [...poems].sort((a, b) => a.wordCount - b.wordCount);
  const mid = Math.floor(sorted.length / 2);
  const medianPoemLength =
    sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1].wordCount + sorted[mid].wordCount) / 2)
      : sorted[mid].wordCount;

  // Length distribution buckets
  const buckets = [
    { bucket: "1-20", min: 1, max: 20 },
    { bucket: "21-40", min: 21, max: 40 },
    { bucket: "41-60", min: 41, max: 60 },
    { bucket: "61-80", min: 61, max: 80 },
    { bucket: "81-100", min: 81, max: 100 },
    { bucket: "101-150", min: 101, max: 150 },
    { bucket: "151-200", min: 151, max: 200 },
    { bucket: "201+", min: 201, max: Infinity },
  ];
  const poemLengthDistribution = buckets.map(({ bucket, min, max }) => ({
    bucket,
    count: poems.filter((p) => p.wordCount >= min && p.wordCount <= max).length,
  }));

  // Global word frequencies (no stopwords), top 50
  const globalFreq = new Map<string, number>();
  for (const poem of poems) {
    for (const [word, count] of poem.wordFrequencies) {
      globalFreq.set(word, (globalFreq.get(word) || 0) + count);
    }
  }
  // The per-poem frequencies are top-20 only; recount from scratch for accuracy
  // We need to re-read files or store all words. Let's accumulate during analysis.
  // Actually we'll do a second pass below. For now use what we have -- but let's
  // accumulate properly instead.

  // We'll compute global freq from a separate accumulator passed in.
  // For simplicity, let's recompute here from all poem files.
  // But we don't have raw text here. So let's adjust the architecture:
  // We'll collect global word freq during the main loop. See main().

  const semanticFieldTotals: Record<string, number> = {};
  for (const field of Object.keys(SEMANTIC_FIELDS)) {
    semanticFieldTotals[field] = 0;
  }
  for (const p of poems) {
    for (const [field, count] of Object.entries(p.semanticFields)) {
      if (field in semanticFieldTotals) {
        semanticFieldTotals[field] += count;
      }
    }
  }

  const pronounTotals: Record<string, number> = {
    ja: 0, ty: 0, on_ona: 0, my: 0, wy: 0, oni: 0,
  };
  for (const p of poems) {
    for (const [cat, count] of Object.entries(p.pronounDistribution)) {
      pronounTotals[cat] += count;
    }
  }

  const negationTotal = poems.reduce((s, p) => s + p.negationCount, 0);

  const punctuationTotals: Record<string, number> = {
    comma: 0, period: 0, question: 0, exclamation: 0,
    ellipsis: 0, dash: 0, colon: 0, semicolon: 0,
  };
  for (const p of poems) {
    for (const [key, count] of Object.entries(p.punctuation)) {
      punctuationTotals[key] += count;
    }
  }

  // Extremes
  const byWord = [...poems].sort((a, b) => b.wordCount - a.wordCount);
  const longestPoem = {
    id: byWord[0].id,
    title: byWord[0].title,
    wordCount: byWord[0].wordCount,
  };
  const shortestPoem = {
    id: byWord[byWord.length - 1].id,
    title: byWord[byWord.length - 1].title,
    wordCount: byWord[byWord.length - 1].wordCount,
  };

  // Filter poems with at least a few words for richness comparison
  const withWords = poems.filter((p) => p.wordCount >= 3);
  const byRichness = [...withWords].sort(
    (a, b) => b.vocabularyRichness - a.vocabularyRichness,
  );
  const mostLexicallyRich = {
    id: byRichness[0].id,
    title: byRichness[0].title,
    ratio: byRichness[0].vocabularyRichness,
  };
  const leastLexicallyRich = {
    id: byRichness[byRichness.length - 1].id,
    title: byRichness[byRichness.length - 1].title,
    ratio: byRichness[byRichness.length - 1].vocabularyRichness,
  };

  const poemIndex = poems
    .map((p) => ({ id: p.id, title: p.title }))
    .sort((a, b) => a.title.localeCompare(b.title, "pl"));

  // ── NEW: Corpus-level anaphors ──
  const globalAnaphors = new Map<string, number>();
  for (const p of poems) {
    for (const [word, count] of p.anaphors) {
      globalAnaphors.set(word, (globalAnaphors.get(word) || 0) + count);
    }
  }
  const corpusAnaphors: [string, number][] = [...globalAnaphors.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // ── NEW: First/last words frequency ──
  const firstWords = new Map<string, number>();
  const lastWords = new Map<string, number>();
  for (const p of poems) {
    if (p.firstWord) firstWords.set(p.firstWord, (firstWords.get(p.firstWord) || 0) + 1);
    if (p.lastWord) lastWords.set(p.lastWord, (lastWords.get(p.lastWord) || 0) + 1);
  }
  const topFirstWords: [string, number][] = [...firstWords.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  const topLastWords: [string, number][] = [...lastWords.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

  // ── NEW: Word length distribution ──
  const globalWordLengthDist: Record<string, number> = { '1-3': 0, '4-5': 0, '6-7': 0, '8-9': 0, '10+': 0 };
  for (const p of poems) {
    for (const [bucket, count] of Object.entries(p.wordLengthDistribution)) {
      globalWordLengthDist[bucket] = (globalWordLengthDist[bucket] || 0) + count;
    }
  }
  const avgWordLengthCorpus = poems.length > 0
    ? +(poems.reduce((s, p) => s + p.avgWordLength, 0) / poems.length).toFixed(2) : 0;

  // ── NEW: Hapax legomena (words used exactly once across ALL poems) ──
  const globalAllWords = new Map<string, number>();
  for (const p of poems) {
    for (const w of p.poemWords) {
      globalAllWords.set(w, (globalAllWords.get(w) || 0) + 1);
    }
  }
  const hapaxLegomena = [...globalAllWords.entries()]
    .filter(([, c]) => c === 1)
    .map(([w]) => w)
    .sort();
  const hapaxCount = hapaxLegomena.length;
  const hapaxSample = hapaxLegomena.slice(0, 50);

  // ── NEW: Global bigrams ──
  const globalBigrams = new Map<string, number>();
  for (const p of poems) {
    for (const [bigram, count] of p.bigrams) {
      globalBigrams.set(bigram, (globalBigrams.get(bigram) || 0) + count);
    }
  }
  const corpusBigrams: [string, number][] = [...globalBigrams.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // ── NEW: Co-occurrence (pairs of meaningful words appearing in same poem) ──
  const coOccurrence = new Map<string, number>();
  for (const p of poems) {
    const words = p.poemWords.filter(w => w.length > 3).slice(0, 30); // limit for perf
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const pair = [words[i], words[j]].sort().join(' + ');
        coOccurrence.set(pair, (coOccurrence.get(pair) || 0) + 1);
      }
    }
  }
  const topCoOccurrences: [string, number][] = [...coOccurrence.entries()]
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  return {
    totalPoems,
    totalWords,
    totalLines,
    avgPoemLength,
    medianPoemLength,
    poemLengthDistribution,
    globalWordFrequencies: [], // filled in main()
    globalVocabularySize: 0,   // filled in main()
    semanticFieldTotals,
    pronounTotals,
    negationTotal,
    punctuationTotals,
    longestPoem,
    shortestPoem,
    mostLexicallyRich,
    leastLexicallyRich,
    poemIndex,
    // New fields
    corpusAnaphors,
    topFirstWords,
    topLastWords,
    globalWordLengthDist,
    avgWordLengthCorpus,
    hapaxCount,
    hapaxSample,
    corpusBigrams,
    topCoOccurrences,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const INPUT_DIR = path.resolve(scriptDir, "../public/wiersze");
  const OUTPUT_POEMS_DIR = path.resolve(scriptDir, "../public/analyses/poems");
  const OUTPUT_CORPUS_PATH = path.resolve(scriptDir, "../public/analyses/corpus.json");

  // Create output directories
  fs.mkdirSync(OUTPUT_POEMS_DIR, { recursive: true });

  // Read all .txt files
  const files = fs
    .readdirSync(INPUT_DIR)
    .filter((f) => f.endsWith(".txt"))
    .sort();

  console.log(`Found ${files.length} poem files in ${INPUT_DIR}`);

  const allAnalyses: PoemAnalysis[] = [];
  const globalFreqMap = new Map<string, number>();
  const globalUniqueWords = new Set<string>();

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(INPUT_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");

    const analysis = analyzePoem(filename, raw);
    allAnalyses.push(analysis);

    // Accumulate global word frequencies (no stopwords) and unique words
    const { bodyLines } = parsePoem(raw);
    const nonEmptyLines = bodyLines.filter((l) => l.trim().length > 0);
    for (const line of nonEmptyLines) {
      for (const w of tokenize(line)) {
        globalUniqueWords.add(w);
        if (!STOPWORDS.has(w)) {
          globalFreqMap.set(w, (globalFreqMap.get(w) || 0) + 1);
        }
      }
    }

    // Write per-poem JSON
    const outPath = path.join(OUTPUT_POEMS_DIR, `${analysis.id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(analysis, null, 2), "utf-8");

    if ((i + 1) % 50 === 0 || i === files.length - 1) {
      console.log(`  Analyzed ${i + 1}/${files.length}: ${analysis.title}`);
    }
  }

  // Build corpus analysis
  console.log("\nBuilding corpus analysis...");
  const corpus = buildCorpusAnalysis(allAnalyses);

  // Fill in global word frequencies (top 50)
  corpus.globalWordFrequencies = [...globalFreqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);
  corpus.globalVocabularySize = globalUniqueWords.size;

  fs.writeFileSync(OUTPUT_CORPUS_PATH, JSON.stringify(corpus, null, 2), "utf-8");

  console.log(`\nDone!`);
  console.log(`  Per-poem analyses: ${OUTPUT_POEMS_DIR}/ (${allAnalyses.length} files)`);
  console.log(`  Corpus analysis:   ${OUTPUT_CORPUS_PATH}`);
  console.log(`  Total poems: ${corpus.totalPoems}`);
  console.log(`  Total words: ${corpus.totalWords}`);
  console.log(`  Global vocabulary size: ${corpus.globalVocabularySize}`);
  console.log(`  Longest poem: "${corpus.longestPoem.title}" (${corpus.longestPoem.wordCount} words)`);
  console.log(`  Shortest poem: "${corpus.shortestPoem.title}" (${corpus.shortestPoem.wordCount} words)`);
}

main();
