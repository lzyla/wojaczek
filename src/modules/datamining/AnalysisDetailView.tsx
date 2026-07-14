import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronDown, Search } from 'lucide-react';
import type { AnalysisType, AnalysisMode, PoemAnalysis, CorpusAnalysis } from './types';
import { loadPoemAnalysis, loadCorpusAnalysis } from './analysisService';
import { renderChart } from './renderChart';

interface AnalysisDetailViewProps {
  analysis: AnalysisType;
  mode: AnalysisMode;
  poemId?: string;
  onBack: () => void;
  onSelectPoem?: (poemId: string) => void;
  onNavigateToPoem?: (poemId: string) => void;
}

/** Extract the data keys available for a given analysis from poem data */
function extractDataKeys(analysisId: string, poem: PoemAnalysis | null): string[] {
  if (!poem) return [];
  const morph = poem.morphology;
  const syn = poem.syntax;
  const phon = poem.phonetics;
  const ai = poem.aiAnalysis;
  const ext = poem.aiAnalysisExtended;

  switch (analysisId) {
    case 'pos-distribution':
      return morph?.posPercent ? Object.keys(morph.posPercent).filter(k => (morph.posPercent[k] ?? 0) > 0) : [];
    case 'verb-tenses':
      return morph?.verbTenses ? Object.keys(morph.verbTenses).filter(k => (morph.verbTenses[k] ?? 0) > 0) : [];
    case 'verb-semantics':
      return morph?.verbSemantics ? Object.keys(morph.verbSemantics) : [];
    case 'adj-types':
      return morph?.adjectiveTypes ? Object.keys(morph.adjectiveTypes) : [];
    case 'pronouns':
      return morph?.pronouns ? Object.keys(morph.pronouns).filter(k => (morph.pronouns![k] ?? 0) > 0) : [];
    case 'negations':
      return morph?.negations ? Object.keys(morph.negations).filter(k => k !== 'total' && k !== 'percentSentences' && ((morph.negations as any)[k] ?? 0) > 0) : [];
    case 'sentence-types':
      return syn?.sentenceTypes ? Object.keys(syn.sentenceTypes).filter(k => (syn.sentenceTypes[k] ?? 0) > 0) : [];
    case 'sound-groups':
      return phon?.soundGroups ? Object.keys(phon.soundGroups) : [];
    case 'rhymes':
      return phon?.rhymes ? Object.keys(phon.rhymes) : [];
    case 'semantic-fields': {
      const fields = (poem as any).nlp?.semantics?.semanticFields || poem.semanticFields;
      return fields ? Object.keys(fields) : [];
    }
    case 'bigrams':
      return poem.bigrams ? poem.bigrams.slice(0, 12).map(([label]) => label) : [];
    case 'senses':
      return ai?.senses ? Object.keys(ai.senses) : [];
    case 'influences':
      return ext?.intertextuality?.influences ? Object.keys(ext.intertextuality.influences) : [];
    case 'anaphors':
      return poem.anaphors ? poem.anaphors.map(([label]) => label) : [];
    case 'word-order':
      return syn?.wordOrder ? ['SVO', 'Inwersje', 'Inne'] : [];
    case 'ellipsis':
      return syn?.ellipsis ? ['Bez podmiotu', 'Bez orzeczenia', 'Niedokonczone'] : [];
    case 'imagery-density':
      return ext?.imageryDensity ? ['Metafory', 'Porownania', 'Personifikacje', 'Hiperbole'] : [];
    case 'adverbs':
      return morph?.adverbs?.top ? morph.adverbs.top.map(a => a.word) : [];
    default:
      return [];
  }
}

const VAR_LABELS: Record<string, string> = {
  NOUN: 'Rzeczownik', VERB: 'Czasownik', ADJ: 'Przymiotnik', ADV: 'Przysłówek',
  PRON: 'Zaimek', ADP: 'Przyimek', CCONJ: 'Spójnik', SCONJ: 'Spójnik podrz.',
  PART: 'Partykuła', DET: 'Określnik', NUM: 'Liczebnik', INTJ: 'Wykrzyknik',
  imperative: 'Rozkazujący', present: 'Teraźniejszy', past: 'Przeszły', infinitive: 'Bezokolicznik',
  ruch: 'Ruch', percepcja: 'Percepcja', stan: 'Stan', destrukcja: 'Destrukcja', tworzenie: 'Tworzenie',
  komunikacja: 'Komunikacja', cialo: 'Ciało',
  zmyslowe: 'Zmysłowe', oceniajace: 'Oceniające', opisowe: 'Opisowe',
  ja: 'Ja', ty: 'Ty', on_ona: 'On/Ona', my: 'My', wy: 'Wy', oni: 'Oni',
  declarative: 'Oznajmujące', interrogative: 'Pytające', exclamatory: 'Wykrzyknikowe',
  szumiace: 'Szumiące', syczace: 'Syczące', nosowe: 'Nosowe', plynne: 'Płynne',
  exact: 'Dokładne', approximate: 'Przybliżone', internal: 'Wewnętrzne',
  assonance: 'Asonanse', alliteration: 'Aliteracje',
  ciało: 'Ciało', smierc: 'Śmierć', erotyka: 'Erotyka', alkohol: 'Alkohol',
  samotnosc: 'Samotność', sacrum: 'Sacrum', noc: 'Noc', bol: 'Ból',
  'śmierć': 'Śmierć', 'samotność': 'Samotność', 'ból': 'Ból',
  wzrok: 'Wzrok', sluch: 'Słuch', dotyk: 'Dotyk', smak: 'Smak', zapach: 'Zapach',
  rimbaud: 'Rimbaud', baudelaire: 'Baudelaire', bursa: 'Bursa',
  stachura: 'Stachura', grochowiak: 'Grochowiak', bialoszewski: 'Białoszewski', rozewicz: 'Różewicz',
};

/** Clean poem title: remove leading asterisks and parentheses */
function cleanTitle(title: string): string {
  let t = title.trim();
  t = t.replace(/^\*\s*\*\s*\*\s*/, '').trim();
  t = t.replace(/^\((.+)\)\s*$/, '$1');
  return t || 'Bez tytułu';
}

export const AnalysisDetailView = ({
  analysis,
  mode,
  poemId,
  onBack,
  onSelectPoem,
  onNavigateToPoem,
}: AnalysisDetailViewProps) => {
  const [poemData, setPoemData] = useState<PoemAnalysis | null>(null);
  const [corpusData, setCorpusData] = useState<CorpusAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Explorer state
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [comparePoem, setComparePoem] = useState<string | null>(null);
  const [showCorpusAvg, setShowCorpusAvg] = useState(false);
  const [comparePoemData, setComparePoemData] = useState<PoemAnalysis | null>(null);
  const [comparePoemLoading, setComparePoemLoading] = useState(false);
  const [showCompareMode, setShowCompareMode] = useState(false);
  const [compareSearch, setCompareSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (mode === 'poem' && poemId) {
          const [poem, corpus] = await Promise.all([
            loadPoemAnalysis(poemId),
            loadCorpusAnalysis(),
          ]);
          if (!cancelled) {
            setPoemData(poem);
            setCorpusData(corpus);
          }
        } else {
          const data = await loadCorpusAnalysis();
          if (!cancelled) setCorpusData(data);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [mode, poemId]);

  // Extract available data keys for current analysis
  const availableKeys = useMemo(
    () => extractDataKeys(analysis.id, poemData),
    [analysis.id, poemData]
  );

  // Initialize selectedVars when keys become available
  useEffect(() => {
    if (availableKeys.length > 0) {
      setSelectedVars(availableKeys);
    }
  }, [availableKeys]);

  // Load comparison poem when selected
  useEffect(() => {
    if (!comparePoem) {
      setComparePoemData(null);
      return;
    }
    let cancelled = false;
    setComparePoemLoading(true);

    loadPoemAnalysis(comparePoem)
      .then(data => { if (!cancelled) setComparePoemData(data); })
      .catch(() => { if (!cancelled) setComparePoemData(null); })
      .finally(() => { if (!cancelled) setComparePoemLoading(false); });

    return () => { cancelled = true; };
  }, [comparePoem]);

  // Reset explorer state when analysis changes
  useEffect(() => {
    setExplorerOpen(false);
    setComparePoem(null);
    setShowCorpusAvg(false);
    setShowCompareMode(false);
    setCompareSearch('');
  }, [analysis.id]);

  // Poem list for comparison picker (exclude current poem)
  const poemList = useMemo(() => {
    if (!corpusData?.poemIndex) return [];
    return corpusData.poemIndex
      .filter(p => p.id !== poemId)
      .map(p => ({ ...p, displayTitle: cleanTitle(p.title) }));
  }, [corpusData, poemId]);

  const filteredPoemList = useMemo(() => {
    if (!compareSearch) return poemList;
    const q = compareSearch.toLowerCase();
    return poemList.filter(p => p.displayTitle.toLowerCase().includes(q));
  }, [poemList, compareSearch]);

  // Build filtered poem data based on selected vars
  const filteredPoemData = useMemo(() => {
    if (!poemData || selectedVars.length === availableKeys.length) return poemData;
    if (selectedVars.length === 0) return poemData;
    // We return the full poem data - filtering is done in renderChart via selectedVars
    return poemData;
  }, [poemData, selectedVars, availableKeys]);

  // Determine if explorer is useful for this analysis
  const hasExplorerVars = availableKeys.length > 1;
  const hasCompareOption = mode === 'poem' && poemId && poemList.length > 0;
  const hasCorpusOption = mode === 'poem' && analysis.modes.includes('corpus');
  const showExplorer = hasExplorerVars || hasCompareOption || hasCorpusOption;

  return (
    <motion.div
      key={`detail-${analysis.id}-${poemId || 'corpus'}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-ink/50 hover:text-ink transition-colors mb-6 mt-4"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        <span className="font-mono text-xs">Powrot</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <span className="text-[11px] uppercase tracking-widest opacity-30 block mb-2">
          {mode === 'poem' && poemData ? poemData.title : 'Cala tworczosc'} &middot; {analysis.label}
        </span>
        <h2 className="text-2xl font-cormorant font-bold tracking-tight leading-tight">
          {analysis.label}
        </h2>
      </div>

      {/* Definition section - always visible */}
      {analysis.definition && (
        <div className="mb-6 border-l-2 border-[#c23030]/20 pl-3">
          <p className="text-xs leading-relaxed opacity-50">{analysis.definition}</p>
        </div>
      )}

      {/* Context stats */}
      {mode === 'poem' && poemData && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border border-ink/10 p-3 text-center">
            <div className="text-lg font-bold">{poemData.wordCount}</div>
            <div className="text-[10px] opacity-40 uppercase">Slow</div>
          </div>
          <div className="border border-ink/10 p-3 text-center">
            <div className="text-lg font-bold">{poemData.lineCount}</div>
            <div className="text-[10px] opacity-40 uppercase">Wersow</div>
          </div>
          <div className="border border-ink/10 p-3 text-center">
            <div className="text-lg font-bold">{(poemData.vocabularyRichness * 100).toFixed(0)}%</div>
            <div className="text-[10px] opacity-40 uppercase">Unikalnosc</div>
          </div>
        </div>
      )}

      {mode === 'corpus' && corpusData && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="border border-ink/10 p-3 text-center">
            <div className="text-lg font-bold">{corpusData.totalPoems}</div>
            <div className="text-[10px] opacity-40 uppercase">Wierszy</div>
          </div>
          <div className="border border-ink/10 p-3 text-center">
            <div className="text-lg font-bold">{corpusData.totalWords.toLocaleString()}</div>
            <div className="text-[10px] opacity-40 uppercase">Slow</div>
          </div>
          <div className="border border-ink/10 p-3 text-center">
            <div className="text-lg font-bold">{corpusData.globalVocabularySize.toLocaleString()}</div>
            <div className="text-[10px] opacity-40 uppercase">Unikalnych</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {loading && (
        <div className="py-12 text-center">
          <div className="inline-block w-5 h-5 border border-ink/20 border-t-ink rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="py-8 text-center">
          <p className="font-mono text-xs text-ink/50">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div>{renderChart(analysis, mode, filteredPoemData, corpusData, selectedVars.length < availableKeys.length ? selectedVars : undefined, onSelectPoem, onNavigateToPoem)}</div>
      )}

      {/* Comparison chart */}
      {!loading && !error && comparePoem && comparePoemData && (
        <div className="mt-6 pt-6 border-t border-ink/10">
          <span className="text-[11px] uppercase tracking-widest opacity-30 block mb-4">
            Porownanie: {cleanTitle(comparePoemData.title)}
          </span>
          {comparePoemLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
            </div>
          ) : (
            <div className="opacity-70">{renderChart(analysis, 'poem', comparePoemData, corpusData, selectedVars.length < availableKeys.length ? selectedVars : undefined)}</div>
          )}
        </div>
      )}

      {/* Corpus average overlay */}
      {!loading && !error && showCorpusAvg && mode === 'poem' && corpusData && (
        <div className="mt-6 pt-6 border-t border-dashed border-ink/10">
          <span className="text-[11px] uppercase tracking-widest opacity-30 block mb-4">
            Srednia korpusu
          </span>
          <div className="opacity-50">{renderChart(analysis, 'corpus', null, corpusData)}</div>
        </div>
      )}

      {/* Interactive Explorer */}
      {!loading && !error && showExplorer && (
        <div className="mt-8 border-t border-ink/10 pt-4">
          <button
            onClick={() => setExplorerOpen(!explorerOpen)}
            className="flex items-center gap-2 w-full text-left group"
          >
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              className={`text-ink/40 transition-transform duration-200 ${explorerOpen ? '' : '-rotate-90'}`}
            />
            <span className="font-mono text-xs text-ink/50 group-hover:text-ink transition-colors">
              Eksploruj zmienne
            </span>
          </button>

          <AnimatePresence>
            {explorerOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-5">
                  {/* Variable chips */}
                  {hasExplorerVars && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider opacity-30 mb-2">Zmienne</p>
                      <div className="flex flex-wrap gap-1.5">
                        {availableKeys.map(key => {
                          const isSelected = selectedVars.includes(key);
                          const label = VAR_LABELS[key] || key;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setSelectedVars(prev =>
                                  isSelected
                                    ? prev.filter(v => v !== key)
                                    : [...prev, key]
                                );
                              }}
                              className={`
                                px-2 py-1 text-[11px] font-mono border transition-all duration-150
                                ${isSelected
                                  ? 'border-ink/30 bg-ink/5 text-ink'
                                  : 'border-ink/10 text-ink/30 hover:border-ink/20 hover:text-ink/50'
                                }
                              `}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      {selectedVars.length < availableKeys.length && (
                        <button
                          onClick={() => setSelectedVars(availableKeys)}
                          className="mt-2 text-[10px] font-mono text-ink/30 hover:text-ink/50 underline transition-colors"
                        >
                          Zaznacz wszystkie
                        </button>
                      )}
                    </div>
                  )}

                  {/* Compare mode */}
                  {hasCompareOption && (
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={showCompareMode}
                          onChange={(e) => {
                            setShowCompareMode(e.target.checked);
                            if (!e.target.checked) {
                              setComparePoem(null);
                              setCompareSearch('');
                            }
                          }}
                          className="w-3 h-3 accent-[#c23030] cursor-pointer"
                        />
                        <span className="text-[11px] font-mono text-ink/50 group-hover:text-ink transition-colors">
                          Porownaj z innym wierszem
                        </span>
                      </label>

                      <AnimatePresence>
                        {showCompareMode && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 ml-5">
                              {/* Search input */}
                              <div className="relative mb-2">
                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink/25" />
                                <input
                                  type="text"
                                  value={compareSearch}
                                  onChange={(e) => setCompareSearch(e.target.value)}
                                  placeholder="Szukaj wiersza..."
                                  className="w-full border border-ink/10 bg-transparent py-1.5 pl-7 pr-2 font-mono text-[11px] placeholder:text-ink/25 focus:outline-none focus:border-ink/25"
                                />
                              </div>

                              {/* Poem list dropdown */}
                              <div className="max-h-40 overflow-y-auto border border-ink/10">
                                {filteredPoemList.slice(0, 30).map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      setComparePoem(p.id);
                                      setCompareSearch('');
                                    }}
                                    className={`
                                      w-full text-left px-2 py-1.5 text-[11px] border-b border-ink/5 last:border-0
                                      hover:bg-ink/[0.03] transition-colors
                                      ${comparePoem === p.id ? 'bg-ink/5 font-medium' : 'text-ink/60'}
                                    `}
                                  >
                                    {p.displayTitle}
                                  </button>
                                ))}
                                {filteredPoemList.length === 0 && (
                                  <p className="text-[10px] text-ink/30 py-2 text-center font-mono">Brak wynikow</p>
                                )}
                              </div>

                              {comparePoem && comparePoemData && (
                                <p className="text-[10px] text-ink/40 mt-2 font-mono">
                                  Wybrano: {cleanTitle(comparePoemData.title)}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Corpus average toggle */}
                  {hasCorpusOption && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={showCorpusAvg}
                        onChange={(e) => setShowCorpusAvg(e.target.checked)}
                        className="w-3 h-3 accent-[#c23030] cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-ink/50 group-hover:text-ink transition-colors">
                        Pokaz srednia korpusu
                      </span>
                    </label>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
