export type AnalysisMode = 'poem' | 'corpus';
export type ChartKind = 'bar' | 'pie' | 'radar' | 'scale' | 'wordcloud' | 'list' | 'histogram' | 'info';

export interface AnalysisType {
  id: string;
  label: string;
  description: string;
  definition: string;
  modes: AnalysisMode[];
  chartType: ChartKind;
}

export interface AnalysisCategory {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  analyses: AnalysisType[];
}

export interface PoemAnalysis {
  id: string;
  title: string;
  wordCount: number;
  lineCount: number;
  uniqueWords: number;
  vocabularyRichness: number;
  avgWordsPerLine: number;
  wordsPerLineDistribution: number[];
  wordFrequencies: [string, number][];
  punctuation: Record<string, number>;
  questionCount: number;
  exclamationCount: number;
  negationCount: number;
  negationWords: string[];
  pronounDistribution: Record<string, number>;
  semanticFields: Record<string, number>;
  anaphors: [string, number][];
  firstWord: string;
  lastWord: string;
  avgWordLength: number;
  wordLengthDistribution: Record<string, number>;
  bigrams: [string, number][];
  poemWords: string[];
  // NLP data (new shape)
  morphology?: {
    pos: Record<string, number>;
    posPercent: Record<string, number>;
    nounConcreteAbstract: { concrete: number; abstract: number; ratio: number };
    verbTenses: Record<string, number>;
    verbSemantics: Record<string, number>;
    adjectiveTypes: Record<string, number>;
    adverbs: { temporalne: string[]; modalne: string[]; sposobu: string[]; top: { word: string; count: number }[] };
    pronouns: Record<string, number>;
    negations: Record<string, number> & { total: number; percentSentences: number };
  };
  syntax?: {
    sentenceLength: { mean: number; median: number; min: number; max: number; distribution: number[] };
    lineLength: { meanWords: number; meanSyllables: number; distribution: number[] };
    sentenceTypes: Record<string, number>;
    ellipsis: { incomplete: number; noSubject: number; noPredicate: number; percent: number };
    enjambement: { count: number; percent: number; positions: number[] };
    wordOrder: { svo: number; inversions: number; other: number; deviationPercent: number };
  };
  phonetics?: {
    vowelConsonant: { vowels: number; consonants: number; ratio: number };
    consonantClusters: { count: number; top: { cluster: string; count: number }[] };
    soundGroups: Record<string, number>;
    rhymes: Record<string, number>;
  };
  metrics?: {
    strophic: { stanzaCount: number; linesPerStanza: number[]; isRegular: boolean; isContinuous: boolean };
    readingTempo: { syllables: number; estimatedSeconds: number; tempoCategory: string };
    regularity: { type: string; regularityScore: number };
  };
  aiAnalysisExtended?: {
    intertextuality: {
      allusions: { source: string; reference: string; evidence: string }[];
      selfQuotes: string[];
      influences: Record<string, number>;
    };
    space: { type: string; evidence: string; openClosedRatio: number };
    timeOfDay: { period: string; season: string; evidence: string };
    motion: { movement: number; stillness: number; dynamism: number; evidence: string };
    imageryDensity: { metaphors: number; comparisons: number; personifications: number; hyperboles: number; per100words: number };
    maskSincerity: { confessionLevel: number; creationLevel: number; ironicDistance: number; autobiographicSignals: string[] };
  };
  // Legacy NLP (if present)
  nlp?: any;
  // AI analysis (if generated)
  aiAnalysis?: {
    emotion?: { primary: string; secondary?: string; intensity: number };
    subjectPresence?: { type: string; evidence: string };
    addressee?: { type: string; evidence: string };
    metaphors?: { source: string; target: string; evidence: string }[];
    temperature?: { value: number; label: string };
    senses?: Record<string, number>;
    autodestruction?: { level: number; signals: string[] };
  };
}

export interface CorpusAnalysis {
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
  corpusAnaphors: [string, number][];
  topFirstWords: [string, number][];
  topLastWords: [string, number][];
  globalWordLengthDist: Record<string, number>;
  avgWordLengthCorpus: number;
  hapaxCount: number;
  hapaxSample: string[];
  corpusBigrams: [string, number][];
  topCoOccurrences: [string, number][];
  // Per-poem emotion data for corpus visualizations
  emotionPerPoem?: {
    id: string;
    title: string;
    wordCount: number;
    emotion?: { primary: string; secondary?: string; intensity: number };
  }[];
  // NLP aggregates (if present)
  nlp?: any;
}
