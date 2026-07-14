import type { AnalysisType, AnalysisMode, PoemAnalysis, CorpusAnalysis } from './types';
import { BarChart } from './components/charts/BarChart';
import { PieChart } from './components/charts/PieChart';
import { RadarChart } from './components/charts/RadarChart';
import { ScaleChart } from './components/charts/ScaleChart';
import { WordCloud } from './components/charts/WordCloud';
import { HistogramChart } from './components/charts/HistogramChart';
import { InfoDisplay, ListDisplay } from './components/charts/InfoDisplay';
import { TreemapChart } from './components/charts/TreemapChart';
import { GaugeChart } from './components/charts/GaugeChart';
import { BubbleChart } from './components/charts/BubbleChart';
import { ForceGraph } from './components/charts/ForceGraph';
import { HeatmapChart } from './components/charts/HeatmapChart';
import { FractalTree } from './components/p5/FractalTree';

/* ── helpers ────────────────────────────────────────────────────── */

function filterByVars<T extends { label: string }>(data: T[], vars?: string[]): T[] {
  if (!vars) return data;
  return data.filter(d => vars.includes(d.label));
}

function filterEntries(entries: [string, number][], vars?: string[]): [string, number][] {
  if (!vars) return entries;
  return entries.filter(([k]) => vars.includes(k));
}

const Pending = ({ msg = 'Dane niedostepne dla tego wiersza' }: { msg?: string }) => (
  <div className="py-8 text-center border border-dashed border-ink/15 rounded">
    <p className="text-sm opacity-40">{msg}</p>
  </div>
);

/* ── label maps ─────────────────────────────────────────────────── */

const POS_LABELS: Record<string, string> = {
  NOUN: 'Rzeczownik', VERB: 'Czasownik', ADJ: 'Przymiotnik', ADV: 'Przyslowek',
  PRON: 'Zaimek', ADP: 'Przyimek', CCONJ: 'Spojnik', SCONJ: 'Spojnik podrzedny',
  PART: 'Partykula', DET: 'Okreslnik', NUM: 'Liczebnik', INTJ: 'Wykrzyknik',
};

const FIELD_LABELS: Record<string, string> = {
  cialo: 'Cialo', smierc: 'Smierc', erotyka: 'Erotyka',
  alkohol: 'Alkohol', samotnosc: 'Samotnosc', sacrum: 'Sacrum',
  noc: 'Noc', bol: 'Bol',
  'ciało': 'Cialo', 'śmierć': 'Smierc', 'samotność': 'Samotnosc', 'ból': 'Bol',
  milosc: 'Milosc', natura: 'Natura', miasto: 'Miasto',
};

const VERB_SEM_LABELS: Record<string, string> = {
  ruch: 'Ruch', percepcja: 'Percepcja', stan: 'Stan',
  destrukcja: 'Destrukcja', tworzenie: 'Tworzenie',
  komunikacja: 'Komunikacja', cialo: 'Cialo',
};

const SENSE_LABELS: Record<string, string> = {
  wzrok: 'Wzrok', sluch: 'Sluch', dotyk: 'Dotyk', smak: 'Smak', zapach: 'Zapach',
};

const TENSE_LABELS: Record<string, string> = {
  imperative: 'Rozkazujacy', present: 'Terazniejszy', past: 'Przeszly',
  infinitive: 'Bezokolicznik', future: 'Przyszly', conditional: 'Warunkowy',
};

const SENTENCE_TYPE_LABELS: Record<string, string> = {
  declarative: 'Oznajmujace', interrogative: 'Pytajace', imperative: 'Rozkazujace', exclamatory: 'Wykrzyknikowe',
};

const INFLUENCE_LABELS: Record<string, string> = {
  rimbaud: 'Rimbaud', baudelaire: 'Baudelaire', bursa: 'Bursa',
  stachura: 'Stachura', grochowiak: 'Grochowiak',
  bialoszewski: 'Bialoszewski', rozewicz: 'Rozewicz',
};

const ADJ_LABELS: Record<string, string> = { zmyslowe: 'Zmyslowe', oceniajace: 'Oceniajace', opisowe: 'Opisowe' };

const SG_LABELS: Record<string, string> = { szumiace: 'Szumiace', syczace: 'Syczace', nosowe: 'Nosowe', plynne: 'Plynne' };

const RHYME_LABELS: Record<string, string> = {
  exact: 'Dokladne', approximate: 'Przyblizione', internal: 'Wewnetrzne',
  assonance: 'Asonanse', alliteration: 'Aliteracje',
};

const PRON_LABELS: Record<string, string> = { ja: 'Ja', ty: 'Ty', on_ona: 'On/Ona', my: 'My', wy: 'Wy', oni: 'Oni', vy: 'Wy' };

const PERIOD_LABELS: Record<string, string> = {
  noc: 'Noc', swit: 'Swit', dzien: 'Dzien', zmierzch: 'Zmierzch',
  rano: 'Rano', poludnie: 'Poludnie', wieczor: 'Wieczor',
};

const SEASON_LABELS: Record<string, string> = {
  wiosna: 'Wiosna', lato: 'Lato', jesien: 'Jesien', zima: 'Zima', nieokreslona: 'Nieokreslona',
};

const TEMPO_LABELS: Record<string, string> = { wolne: 'Wolne', srednie: 'Srednie', szybkie: 'Szybkie', umiarkowane: 'Umiarkowane' };

const REGULARITY_TYPE_LABELS: Record<string, string> = {
  regularny: 'Regularny', polregularny: 'Polregularny', wolny: 'Wolny', nieregularny: 'Nieregularny',
};

/* ── main renderer ──────────────────────────────────────────────── */

export function renderChart(
  analysis: AnalysisType,
  mode: AnalysisMode,
  poem: PoemAnalysis | null,
  corpus: CorpusAnalysis | null,
  selectedVars?: string[],
  onSelectPoem?: (poemId: string) => void,
  onNavigateToPoem?: (poemId: string) => void,
): React.ReactNode {
  const { id } = analysis;

  // ═══════════════════════════════════════════════════════════════
  //  POEM MODE
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'poem' && poem) {
    const morph = poem.morphology;
    const syn = poem.syntax;
    const phon = poem.phonetics;
    const met = poem.metrics;
    const ext = poem.aiAnalysisExtended;
    const ai = poem.aiAnalysis;

    switch (id) {

      /* ─── 1. pos-distribution ─────────────────────────────── */
      case 'pos-distribution': {
        if (!morph?.posPercent) return <Pending />;
        return (
          <BarChart
            data={filterEntries(
              Object.entries(morph.posPercent)
                .filter(([, v]) => v > 1)
                .sort(([, a], [, b]) => b - a),
              selectedVars,
            ).map(([k, v]) => ({ label: POS_LABELS[k] || k, value: Math.round(v * 10) / 10 }))}
            colorful
          />
        );
      }

      /* ─── 2. noun-concrete-abstract ───────────────────────── */
      case 'noun-concrete-abstract': {
        if (!morph?.nounConcreteAbstract) return <Pending />;
        return (
          <ScaleChart
            value={morph.nounConcreteAbstract.ratio}
            min={0}
            max={1}
            leftLabel="Konkret"
            rightLabel="Abstrakt"
            valueLabel={`${(morph.nounConcreteAbstract.ratio * 100).toFixed(0)}% konkretne`}
          />
        );
      }

      /* ─── 3. verb-tenses ──────────────────────────────────── */
      case 'verb-tenses': {
        if (!morph?.verbTenses) return <Pending />;
        const data = filterEntries(
          Object.entries(morph.verbTenses).filter(([, v]) => v > 0),
          selectedVars,
        ).map(([k, v]) => ({ label: TENSE_LABELS[k] || k, value: v }));
        return data.length > 0 ? (
          <PieChart data={data} colorful />
        ) : <Pending />;
      }

      /* ─── 4. verb-semantics ───────────────────────────────── */
      case 'verb-semantics': {
        if (!morph?.verbSemantics) return <Pending />;
        const entries = filterEntries(Object.entries(morph.verbSemantics), selectedVars);
        return entries.length > 0 ? (
          <RadarChart
            axes={entries.map(([k]) => VERB_SEM_LABELS[k] || k)}
            values={entries.map(([, v]) => v)}
            accentColor="#c23030"
          />
        ) : <Pending />;
      }

      /* ─── 5. adj-types ────────────────────────────────────── */
      case 'adj-types': {
        if (!morph?.adjectiveTypes) return <Pending />;
        const data = filterEntries(Object.entries(morph.adjectiveTypes), selectedVars)
          .map(([k, v]) => ({ label: ADJ_LABELS[k] || k, value: v }));
        return data.length > 0 ? (
          <BarChart data={data} colorful />
        ) : <Pending />;
      }

      /* ─── 6. adverbs ──────────────────────────────────────── */
      case 'adverbs': {
        if (!morph?.adverbs?.top || morph.adverbs.top.length === 0) return <Pending />;
        return (
          <ListDisplay
            items={morph.adverbs.top.slice(0, 15).map(a => ({
              primary: a.word,
              secondary: `${a.count}x`,
            }))}
          />
        );
      }

      /* ─── 7. pronouns ─────────────────────────────────────── */
      case 'pronouns': {
        if (!morph?.pronouns) return <Pending />;
        const data = filterEntries(
          Object.entries(morph.pronouns).filter(([, v]) => v > 0),
          selectedVars,
        ).map(([k, v]) => ({ label: PRON_LABELS[k] || k, value: v }));
        return data.length > 0 ? (
          <BarChart data={data} colorful />
        ) : <Pending />;
      }

      /* ─── 8. negations ────────────────────────────────────── */
      case 'negations': {
        if (!morph?.negations) return <Pending />;
        const neg = morph.negations;
        const negEntries = Object.entries(neg)
          .filter(([k, v]) => k !== 'total' && k !== 'percentSentences' && (v as number) > 0)
          .map(([k, v]) => ({ label: k, value: v as number }));
        return (
          <>
            {negEntries.length > 0 && <BarChart data={negEntries} colorful />}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="border border-ink/10 p-3 text-center">
                <div className="text-lg font-bold">{neg.total}</div>
                <div className="text-[10px] opacity-40 uppercase">Negacji ogolnie</div>
              </div>
              <div className="border border-ink/10 p-3 text-center">
                <div className="text-lg font-bold">{neg.percentSentences?.toFixed(0) || '?'}%</div>
                <div className="text-[10px] opacity-40 uppercase">Zdan z negacja</div>
              </div>
            </div>
          </>
        );
      }

      /* ─── 9. sentence-length ──────────────────────────────── */
      case 'sentence-length': {
        if (!syn?.sentenceLength?.distribution) return <Pending />;
        return (
          <>
            <HistogramChart data={syn.sentenceLength.distribution} xLabel="Liczba slow w zdaniu" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="border border-ink/10 p-3 text-center">
                <div className="text-lg font-bold">{syn.sentenceLength.mean?.toFixed(1)}</div>
                <div className="text-[10px] opacity-40 uppercase">Srednia</div>
              </div>
              <div className="border border-ink/10 p-3 text-center">
                <div className="text-lg font-bold">{syn.sentenceLength.median}</div>
                <div className="text-[10px] opacity-40 uppercase">Mediana</div>
              </div>
            </div>
          </>
        );
      }

      /* ─── 10. line-length ─────────────────────────────────── */
      case 'line-length': {
        if (!syn?.lineLength?.distribution) return <Pending />;
        return (
          <HistogramChart data={syn.lineLength.distribution} xLabel="Liczba slow w wersie" />
        );
      }

      /* ─── 11. sentence-types ──────────────────────────────── */
      case 'sentence-types': {
        if (!syn?.sentenceTypes) return <Pending />;
        const data = filterEntries(
          Object.entries(syn.sentenceTypes).filter(([, v]) => v > 0),
          selectedVars,
        ).map(([k, v]) => ({ label: SENTENCE_TYPE_LABELS[k] || k, value: v }));
        return data.length > 0 ? (
          <PieChart data={data} colorful />
        ) : <Pending />;
      }

      /* ─── 12. ellipsis ────────────────────────────────────── */
      case 'ellipsis': {
        if (!syn?.ellipsis) return <Pending />;
        return (
          <>
            <BarChart
              data={filterByVars([
                { label: 'Niedokonczone', value: syn.ellipsis.incomplete },
                { label: 'Bez podmiotu', value: syn.ellipsis.noSubject },
                { label: 'Bez orzeczenia', value: syn.ellipsis.noPredicate },
              ], selectedVars)}
              colorful
            />
            <div className="border border-ink/10 p-3 text-center mt-3">
              <div className="text-lg font-bold">{(syn.ellipsis.percent * 100).toFixed(0)}%</div>
              <div className="text-[10px] opacity-40 uppercase">Zdan eliptycznych</div>
            </div>
          </>
        );
      }

      /* ─── 13. enjambement ─────────────────────────────────── */
      case 'enjambement': {
        if (!syn?.enjambement) return <Pending />;
        return (
          <>
            <InfoDisplay items={[
              { label: 'Liczba przerzutni', value: syn.enjambement.count },
              { label: 'Procent wersow', value: `${(syn.enjambement.percent * 100).toFixed(0)}%` },
            ]} />
            {syn.enjambement.positions.length > 0 && (
              <div className="text-xs opacity-40 mt-2">
                <span className="uppercase tracking-wider">Pozycje: </span>
                {syn.enjambement.positions.map(p => `w. ${p}`).join(', ')}
              </div>
            )}
          </>
        );
      }

      /* ─── 14. word-order ──────────────────────────────────── */
      case 'word-order': {
        if (!syn?.wordOrder) return <Pending />;
        const wo = syn.wordOrder;
        return (
          <BarChart
            data={filterByVars([
              { label: 'SVO (norma)', value: wo.svo },
              { label: 'Inwersje', value: wo.inversions },
              { label: 'Inne', value: wo.other },
            ], selectedVars)}
            colorful
          />
        );
      }

      /* ─── 15. vowel-consonant ─────────────────────────────── */
      case 'vowel-consonant': {
        if (!phon?.vowelConsonant) return <Pending />;
        const vc = phon.vowelConsonant;
        const total = vc.vowels + vc.consonants;
        const vowelPct = total > 0 ? vc.vowels / total : 0.42;
        return (
          <ScaleChart
            value={vowelPct}
            min={0.3}
            max={0.6}
            leftLabel="Samogloski"
            rightLabel="Spolgloski"
            valueLabel={`${(vowelPct * 100).toFixed(0)}% samoglosek`}
          />
        );
      }

      /* ─── 16. consonant-clusters ──────────────────────────── */
      case 'consonant-clusters': {
        if (!phon?.consonantClusters?.top?.length) return <Pending />;
        return (
          <ListDisplay
            items={phon.consonantClusters.top.map(c => ({
              primary: c.cluster,
              secondary: `${c.count}x`,
            }))}
          />
        );
      }

      /* ─── 17. rhymes ──────────────────────────────────────── */
      case 'rhymes': {
        if (!phon?.rhymes) return <Pending />;
        const data = filterEntries(Object.entries(phon.rhymes), selectedVars)
          .map(([k, v]) => ({ label: RHYME_LABELS[k] || k, value: v }));
        return (
          <BarChart data={data} colorful />
        );
      }

      /* ─── 18. sound-groups ────────────────────────────────── */
      case 'sound-groups': {
        if (!phon?.soundGroups) return <Pending />;
        return (
          <BarChart
            data={filterEntries(Object.entries(phon.soundGroups), selectedVars)
              .map(([k, v]) => ({ label: SG_LABELS[k] || k, value: v }))}
            colorful
          />
        );
      }

      /* ─── 19. semantic-fields ─────────────────────────────── */
      case 'semantic-fields': {
        const fields = (poem as any).nlp?.semantics?.semanticFields || poem.semanticFields;
        if (!fields) return <Pending />;
        const entries = filterEntries(Object.entries(fields) as [string, number][], selectedVars);
        return entries.length > 0 ? (
          <TreemapChart
            data={entries.map(([k, v]) => ({ label: FIELD_LABELS[k] || k, value: v as number }))}
          />
        ) : <Pending />;
      }

      /* ─── 20. metaphors ───────────────────────────────────── */
      case 'metaphors': {
        if (!ai?.metaphors?.length) return <Pending msg="Dane AI w przygotowaniu..." />;
        const metNodes: { id: string; group: string; value?: number }[] = [];
        const metLinks: { source: string; target: string; value?: number }[] = [];
        const nodeSet = new Set<string>();
        for (const m of ai.metaphors) {
          if (!nodeSet.has(m.source)) { metNodes.push({ id: m.source, group: 'source', value: 3 }); nodeSet.add(m.source); }
          if (!nodeSet.has(m.target)) { metNodes.push({ id: m.target, group: 'target', value: 3 }); nodeSet.add(m.target); }
          metLinks.push({ source: m.source, target: m.target, value: 2 });
        }
        return (
          <>
            <ForceGraph nodes={metNodes} links={metLinks} height={300} />
            <div className="mt-4 pt-4 border-t border-ink/10">
              <ListDisplay
                items={ai.metaphors.map((m: any) => ({
                  primary: `${m.source} \u2192 ${m.target}`,
                  secondary: m.example || m.evidence,
                }))}
              />
            </div>
          </>
        );
      }

      /* ─── 21. word-cloud ──────────────────────────────────── */
      case 'word-cloud': {
        if (!poem.wordFrequencies?.length) return <Pending />;
        return (
          <WordCloud
            words={poem.wordFrequencies.slice(0, 30).map(([text, size]) => ({ text, size }))}
          />
        );
      }

      /* ─── 22. bigrams ─────────────────────────────────────── */
      case 'bigrams': {
        if (!poem.bigrams?.length) return <Pending />;
        return (
          <ListDisplay
            items={poem.bigrams.slice(0, 15).map(([bigram, count]) => ({
              primary: bigram,
              secondary: `${count}×`,
            }))}
          />
        );
      }

      /* ─── 23. subject-presence ────────────────────────────── */
      case 'subject-presence': {
        if (!ai?.subjectPresence) return <Pending msg="Dane AI w przygotowaniu..." />;
        const typeMap: Record<string, string> = { jawne: 'Jawne \u201eja\u201d', ukryte: 'Ukryte', bezosobowe: 'Bezosobowe' };
        const typeLabel = typeMap[ai.subjectPresence.type] || ai.subjectPresence.type;
        const pieData = [
          { label: typeLabel, value: 1 },
        ];
        return (
          <>
            <PieChart data={pieData} colorful />
            {ai.subjectPresence.evidence && (
              <div className="border border-ink/10 p-3 mt-3 text-sm opacity-60">
                {ai.subjectPresence.evidence}
              </div>
            )}
          </>
        );
      }

      /* ─── 24. addressee ───────────────────────────────────── */
      case 'addressee': {
        if (!ai?.addressee) return <Pending msg="Dane AI w przygotowaniu..." />;
        const addrMap: Record<string, string> = {
          ty: 'Do \u201ety\u201d', 'bóg': 'Do Boga', siebie: 'Do siebie',
          nikt: 'Do nikogo', czytelnik: 'Do czytelnika',
        };
        return (
          <InfoDisplay items={[
            {
              label: 'Do kogo mowi',
              value: addrMap[ai.addressee.type] || ai.addressee.type,
              sub: ai.addressee.evidence,
            },
          ]} />
        );
      }

      /* ─── 25. mask-sincerity ──────────────────────────────── */
      case 'mask-sincerity': {
        if (!ext?.maskSincerity) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <ScaleChart
            value={ext.maskSincerity.confessionLevel}
            min={0}
            max={1}
            leftLabel="Konfesja"
            rightLabel="Maska"
            valueLabel={`Konfesyjnosc: ${(ext.maskSincerity.confessionLevel * 100).toFixed(0)}%`}
          />
        );
      }

      /* ─── 26. emotion ─────────────────────────────────────── */
      case 'emotion': {
        if (!ai?.emotion) return <Pending msg="Dane AI w przygotowaniu..." />;
        const emotionLabels = ['gniew', 'smutek', 'strach', 'ironia', 'rezygnacja', 'tęsknota', 'czułość', 'obrzydzenie', 'rozpacz', 'bunt'];
        const emotionValues = emotionLabels.map(e => {
          if (ai.emotion.primary === e) return ai.emotion.intensity;
          if (ai.emotion.secondary === e) return ai.emotion.intensity * 0.5;
          return 0.05;
        });
        return (
          <>
            <RadarChart
              axes={emotionLabels}
              values={emotionValues}
              accentColor="#c23030"
            />
            <div className="mt-4 pt-4 border-t border-ink/10 flex items-center gap-4">
              <GaugeChart value={ai.emotion.intensity} label="Intensywność" minLabel="Słaba" maxLabel="Silna" color="#c23030" />
            </div>
            <div className="mt-3 text-center">
              <span className="text-sm font-medium">{ai.emotion.primary}</span>
              {ai.emotion.secondary && <span className="text-sm opacity-50"> · {ai.emotion.secondary}</span>}
            </div>
          </>
        );
      }

      /* ─── 27. autodestruction ─────────────────────────────── */
      case 'autodestruction': {
        if (!ai?.autodestruction) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <>
            <GaugeChart
              value={ai.autodestruction.level}
              label="Autodestrukcja"
              minLabel="Brak"
              maxLabel="Silna"
              disclaimer="Jeśli potrzebujesz pomocy, zadzwoń: 116 123 (Telefon Zaufania)"
            />
            {ai.autodestruction.signals?.length > 0 && (
              <div className="border border-ink/10 p-4 mt-3">
                <p className="text-xs uppercase tracking-wider opacity-40 mb-2">Sygnały</p>
                <ul className="text-sm opacity-60 space-y-1">
                  {ai.autodestruction.signals.map((s: string, i: number) => <li key={i}>{'\u2022'} {s}</li>)}
                </ul>
              </div>
            )}
          </>
        );
      }

      /* ─── 28. allusions ───────────────────────────────────── */
      case 'allusions': {
        if (!ext?.intertextuality?.allusions?.length) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <ListDisplay
            items={ext.intertextuality.allusions.map(a => ({
              primary: a.reference,
              secondary: `Zrodlo: ${a.source}`,
              tertiary: a.evidence,
            }))}
          />
        );
      }

      /* ─── 29. anaphors ────────────────────────────────────── */
      case 'anaphors': {
        let anaphorData = poem.anaphors || [];
        if (selectedVars) anaphorData = anaphorData.filter(([label]) => selectedVars.includes(label));
        if (anaphorData.length === 0) return <Pending msg="Brak powtarzajacych sie anafor" />;
        return (
          <ListDisplay
            items={anaphorData.map(([phrase, count]) => ({
              primary: phrase,
              secondary: `${count}x`,
            }))}
          />
        );
      }

      /* ─── 30. influences ──────────────────────────────────── */
      case 'influences': {
        if (!ext?.intertextuality?.influences) return <Pending msg="Dane AI w przygotowaniu..." />;
        const entries = filterEntries(Object.entries(ext.intertextuality.influences), selectedVars);
        return entries.length > 0 ? (
          <BarChart
            data={entries
              .sort(([, a], [, b]) => b - a)
              .map(([k, v]) => ({ label: INFLUENCE_LABELS[k] || k, value: Math.round(v * 100) }))}
            colorful
          />
        ) : <Pending />;
      }

      /* ─── 31. senses ──────────────────────────────────────── */
      case 'senses': {
        if (!ai?.senses) return <Pending msg="Dane AI w przygotowaniu..." />;
        const entries = filterEntries(Object.entries(ai.senses), selectedVars);
        return entries.length > 0 ? (
          <RadarChart
            axes={entries.map(([k]) => SENSE_LABELS[k] || k)}
            values={entries.map(([, v]) => v)}
            accentColor="#c23030"
          />
        ) : <Pending />;
      }

      /* ─── 32. temperature ─────────────────────────────────── */
      case 'temperature': {
        if (!ai?.temperature) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <ScaleChart
            value={ai.temperature.value}
            min={0}
            max={1}
            leftLabel="Zimne"
            rightLabel="Gorace"
            valueLabel={ai.temperature.label}
            accentColor="#c23030"
          />
        );
      }

      /* ─── 33. space ───────────────────────────────────────── */
      case 'space': {
        if (!ext?.space) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <ScaleChart
            value={ext.space.openClosedRatio}
            min={0}
            max={1}
            leftLabel="Zamknieta"
            rightLabel="Otwarta"
            valueLabel={`${(ext.space.openClosedRatio * 100).toFixed(0)}% otwarta`}
            accentColor="#c23030"
          />
        );
      }

      /* ─── 34. time-of-day ─────────────────────────────────── */
      case 'time-of-day': {
        if (!ext?.timeOfDay) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <InfoDisplay items={[
            { label: 'Pora dnia', value: PERIOD_LABELS[ext.timeOfDay.period] || ext.timeOfDay.period },
            { label: 'Pora roku', value: SEASON_LABELS[ext.timeOfDay.season] || ext.timeOfDay.season },
            ...(ext.timeOfDay.evidence ? [{ label: 'Dowod', value: ext.timeOfDay.evidence }] : []),
          ]} />
        );
      }

      /* ─── 35. motion ──────────────────────────────────────── */
      case 'motion': {
        if (!ext?.motion) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <ScaleChart
            value={ext.motion.dynamism}
            min={0}
            max={1}
            leftLabel="Bezruch"
            rightLabel="Ruch"
            valueLabel={`Dynamizm: ${(ext.motion.dynamism * 100).toFixed(0)}%`}
            accentColor="#c23030"
          />
        );
      }

      /* ─── 36. imagery-density ─────────────────────────────── */
      case 'imagery-density': {
        if (!ext?.imageryDensity) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <BarChart
            data={filterByVars([
              { label: 'Metafory', value: ext.imageryDensity.metaphors },
              { label: 'Porownania', value: ext.imageryDensity.comparisons },
              { label: 'Personifikacje', value: ext.imageryDensity.personifications },
              { label: 'Hiperbole', value: ext.imageryDensity.hyperboles },
            ], selectedVars)}
            colorful
          />
        );
      }

      /* ─── 37. regularity ──────────────────────────────────── */
      case 'regularity': {
        if (!met?.regularity) return <Pending />;
        return (
          <InfoDisplay items={[
            { label: 'Typ', value: REGULARITY_TYPE_LABELS[met.regularity.type] || met.regularity.type },
            { label: 'Regularnosc', value: `${(met.regularity.regularityScore * 100).toFixed(0)}%` },
          ]} />
        );
      }

      /* ─── 38. strophic ────────────────────────────────────── */
      case 'strophic': {
        if (!met?.strophic) return <Pending />;
        return (
          <InfoDisplay items={[
            {
              label: 'Liczba strof',
              value: met.strophic.stanzaCount,
              sub: met.strophic.isContinuous ? 'Wiersz ciagly (bez strof)' : `${met.strophic.stanzaCount} strof`,
            },
            { label: 'Wersy na strofe', value: met.strophic.linesPerStanza.join(', ') },
            { label: 'Regularnosc', value: met.strophic.isRegular ? 'Regularna' : 'Nieregularna' },
          ]} />
        );
      }

      /* ─── 39. reading-tempo ───────────────────────────────── */
      case 'reading-tempo': {
        if (!met?.readingTempo) return <Pending />;
        return (
          <InfoDisplay items={[
            { label: 'Tempo', value: TEMPO_LABELS[met.readingTempo.tempoCategory] || met.readingTempo.tempoCategory },
            { label: 'Czas czytania', value: `${met.readingTempo.estimatedSeconds}s` },
            { label: 'Sylaby', value: met.readingTempo.syllables },
          ]} />
        );
      }

      /* ─── 40. fractal ──────────────────────────────────── */
      case 'fractal': {
        const fr = (poem as any).fractal;
        if (!fr) return <Pending msg="Za mało wersów do analizy fraktalnej (min. 15)" />;
        const h = fr.hurstExponent;
        const alpha = fr.dfaAlpha;
        const interpretation = h > 0.75
          ? 'Silna persystencja — po długim zdaniu zazwyczaj następuje kolejne długie. Wiersz ma płynną, narracyjną strukturę z wyraźnymi wzorcami rytmicznymi.'
          : h > 0.6
          ? 'Umiarkowana persystencja — zdania tworzą grupki o podobnej długości, ale zdarzają się skoki. Struktura jest częściowo uporządkowana.'
          : h > 0.45
          ? 'Brak wyraźnych wzorców — długości zdań zmieniają się nieprzewidywalnie. Styl bliski losowości, bez dominującego rytmu.'
          : 'Antypersystencja — po długim zdaniu prawie zawsze następuje krótkie. Styl telegraficzny, poszarpany, oparty na kontrastach długości.';
        return (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border border-ink/10 p-5 text-center">
                <div className="text-3xl font-bold" style={{ color: '#c23030' }}>{h ?? '—'}</div>
                <div className="text-[9px] uppercase tracking-widest opacity-40 mt-1">Wykładnik Hursta</div>
              </div>
              <div className="border border-ink/10 p-5 text-center">
                <div className="text-3xl font-bold">{alpha ?? '—'}</div>
                <div className="text-[9px] uppercase tracking-widest opacity-40 mt-1">DFA α</div>
              </div>
            </div>
            <ScaleChart value={h || 0.5} min={0} max={1} leftLabel="Telegraficzny" rightLabel="Narracyjny" />
            <p className="text-[12px] opacity-50 mt-4 leading-relaxed">{interpretation}</p>
          </>
        );
      }

      default:
        return <Pending msg="Wybierz wiersz, aby zobaczyc wizualizacje" />;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  CORPUS MODE
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'corpus' && corpus) {
    const nlp = corpus.nlp;

    switch (id) {

      /* ─── 1. pos-distribution ─────────────────────────────── */
      case 'pos-distribution': {
        const posData = nlp?.posPercent || nlp?.posDistribution;
        if (!posData) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const isPercent = !!nlp?.posPercent;
        return (
          <BarChart
            data={Object.entries(posData)
              .filter(([, v]) => (v as number) > (isPercent ? 0.01 : 1))
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([label, value]) => ({
                label: POS_LABELS[label] || label,
                value: isPercent ? Math.round((value as number) * 1000) / 10 : (value as number),
              }))}
            colorful
          />
        );
      }

      /* ─── 2. noun-concrete-abstract ───────────────────────── */
      case 'noun-concrete-abstract': {
        const nca = nlp?.nounConcreteAbstract;
        if (!nca) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const ratio = nca.ratio != null ? nca.ratio : ((nca.concrete + nca.abstract) > 0 ? nca.concrete / (nca.concrete + nca.abstract) : 0.5);
        return (
          <>
            <ScaleChart value={ratio} min={0} max={1} leftLabel="Konkret" rightLabel="Abstrakt" valueLabel={`${(ratio * 100).toFixed(0)}% konkretne`} />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="border border-ink/10 p-3 text-center">
                <div className="text-lg font-bold">{nca.concrete}</div>
                <div className="text-[10px] opacity-40 uppercase">Konkretne</div>
              </div>
              <div className="border border-ink/10 p-3 text-center">
                <div className="text-lg font-bold">{nca.abstract}</div>
                <div className="text-[10px] opacity-40 uppercase">Abstrakcyjne</div>
              </div>
            </div>
          </>
        );
      }

      /* ─── 3. verb-tenses ──────────────────────────────────── */
      case 'verb-tenses': {
        const vt = nlp?.verbTensesTotal || nlp?.verbTenses;
        if (vt) {
          return (
            <BarChart data={Object.entries(vt).filter(([, v]) => (v as number) > 0).map(([k, v]) => ({ label: TENSE_LABELS[k] || k, value: v as number }))} colorful />
          );
        }
        return <InfoDisplay items={[
          { label: 'Rozklad trybow i czasow', value: 'Dostepny per wiersz' },
        ]} />;
      }

      /* ─── 4. verb-semantics ───────────────────────────────── */
      case 'verb-semantics': {
        if (!nlp?.verbSemantics) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const entries = Object.entries(nlp.verbSemantics).filter(([, v]) => (v as number) > 0);
        return entries.length > 0 ? (
          <RadarChart
            axes={entries.map(([k]) => VERB_SEM_LABELS[k] || k)}
            values={entries.map(([, v]) => v as number)}
            accentColor="#c23030"
          />
        ) : <Pending msg="Dane NLP korpusu niedostepne" />;
      }

      /* ─── 5. adj-types ────────────────────────────────────── */
      case 'adj-types': {
        if (!nlp?.adjectiveTypes) return <Pending msg="Dane NLP korpusu niedostepne" />;
        return (
          <BarChart
            data={Object.entries(nlp.adjectiveTypes).map(([k, v]) => ({ label: ADJ_LABELS[k] || k, value: v as number }))}
            colorful
          />
        );
      }

      /* ─── 6. adverbs ──────────────────────────────────────── */
      case 'adverbs': {
        if (!nlp?.topAdverbs || (nlp.topAdverbs as any[]).length === 0) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const advData = (nlp.topAdverbs as [string, number][]).slice(0, 15).map(([word, count]) => ({ label: word, value: count }));
        return <BarChart data={advData} colorful />;
      }

      /* ─── 7. pronouns ─────────────────────────────────────── */
      case 'pronouns': {
        const pronounData = nlp?.pronouns || corpus.pronounTotals;
        if (!pronounData) return <Pending msg="Dane NLP korpusu niedostepne" />;
        return (
          <BarChart
            data={Object.entries(pronounData)
              .filter(([, v]) => (v as number) > 0)
              .map(([k, v]) => ({ label: PRON_LABELS[k] || k, value: v as number }))}
            colorful
          />
        );
      }

      /* ─── 8. negations ────────────────────────────────────── */
      case 'negations': {
        if (!nlp?.negations) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const negData = nlp.negations as Record<string, number>;
        return (
          <BarChart
            data={Object.entries(negData)
              .filter(([, v]) => (v as number) > 0)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([k, v]) => ({ label: k, value: v as number }))}
            colorful
          />
        );
      }

      /* ─── 9. sentence-length ──────────────────────────────── */
      case 'sentence-length': {
        if (nlp?.avgSentenceLength == null) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const slData = [
          { label: 'Wojaczek (śr.)', value: nlp.avgSentenceLength as number },
          { label: 'Proza PL (śr.)', value: 12 },
          { label: 'Poezja PL (śr.)', value: 6 },
        ];
        return <BarChart data={slData} colorful />;
      }

      /* ─── 10. line-length ─────────────────────────────────── */
      case 'line-length': {
        if (nlp?.avgLineWordsPerLine == null) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const llData = [
          { label: 'Wojaczek (śr.)', value: nlp.avgLineWordsPerLine as number },
          { label: 'Różewicz (śr.)', value: 3.2 },
          { label: 'Miłosz (śr.)', value: 7.1 },
        ];
        return <BarChart data={llData} colorful />;
      }

      /* ─── 11. sentence-types ──────────────────────────────── */
      case 'sentence-types': {
        if (!nlp?.sentenceTypes) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const data = Object.entries(nlp.sentenceTypes)
          .filter(([, v]) => (v as number) > 0)
          .map(([k, v]) => ({ label: SENTENCE_TYPE_LABELS[k] || k, value: v as number }));
        return data.length > 0 ? (
          <PieChart data={data} colorful />
        ) : <Pending msg="Dane NLP korpusu niedostepne" />;
      }

      /* ─── 12. ellipsis ────────────────────────────────────── */
      case 'ellipsis': {
        const el = nlp?.ellipsisTotal as Record<string, number> | undefined;
        if (el) {
          const data = Object.entries(el).filter(([,v]) => v > 0).map(([k,v]) => ({
            label: k === 'incomplete' ? 'Niepełne' : k === 'noSubject' ? 'Brak podmiotu' : k === 'noPredicate' ? 'Brak orzeczenia' : k,
            value: v,
          }));
          return <BarChart data={data} colorful />;
        }
        return <InfoDisplay items={[{ label: 'Analiza elips', value: 'dostępna per wiersz' }]} />;
      }

      /* ─── 13. enjambement ─────────────────────────────────── */
      case 'enjambement': {
        if (nlp?.avgEnjambementPercent == null) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const enjPct = nlp.avgEnjambementPercent as number;
        return (
          <ScaleChart
            value={enjPct}
            min={0}
            max={1}
            leftLabel="0%"
            rightLabel="100%"
            valueLabel={`Srednia przerzutni: ${(enjPct * 100).toFixed(0)}%`}
          />
        );
      }

      /* ─── 14. word-order ──────────────────────────────────── */
      case 'word-order': {
        const wo = nlp?.wordOrderTotal as Record<string, number> | undefined;
        if (wo) {
          const WO_LABELS: Record<string, string> = { svo: 'SVO (normalny)', inversions: 'Inwersje', other: 'Inny szyk' };
          const data = Object.entries(wo).filter(([,v]) => v > 0).map(([k,v]) => ({ label: WO_LABELS[k] || k, value: v }));
          return <BarChart data={data} colorful />;
        }
        return <InfoDisplay items={[{ label: 'Analiza szyku', value: 'dostępna per wiersz' }]} />;
      }

      /* ─── 15. vowel-consonant ─────────────────────────────── */
      case 'vowel-consonant': {
        if (nlp?.avgVowelConsonantRatio == null) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const ratio = nlp.avgVowelConsonantRatio as number;
        const vowelPct = ratio / (1 + ratio);
        return (
          <ScaleChart
            value={vowelPct}
            min={0.3}
            max={0.6}
            leftLabel="Samogloski"
            rightLabel="Spolgloski"
            valueLabel={`${(vowelPct * 100).toFixed(0)}% samoglosek (ratio: ${ratio.toFixed(2)})`}
          />
        );
      }

      /* ─── 16. consonant-clusters ──────────────────────────── */
      case 'consonant-clusters': {
        if (nlp?.avgConsonantClusters == null) return <Pending msg="Dane NLP korpusu niedostepne" />;
        const ccData = [
          { label: 'Wojaczek (śr.)', value: Math.round((nlp.avgConsonantClusters as number) * 10) / 10 },
          { label: 'Norma PL', value: 8 },
        ];
        return <BarChart data={ccData} colorful />;
      }

      /* ─── 17. rhymes ──────────────────────────────────────── */
      case 'rhymes': {
        const rh = nlp?.rhymesTotal as Record<string, number> | undefined;
        if (rh) {
          const RH_LABELS: Record<string, string> = { exact: 'Dokładne', approximate: 'Niedokładne', internal: 'Wewnętrzne', assonance: 'Asonanse', alliteration: 'Aliteracje' };
          const data = Object.entries(rh).filter(([,v]) => v > 0).map(([k,v]) => ({ label: RH_LABELS[k] || k, value: v }));
          return <BarChart data={data} colorful />;
        }
        return <InfoDisplay items={[{ label: 'Analiza rymów', value: 'dostępna per wiersz' }]} />;
      }

      /* ─── 18. sound-groups ────────────────────────────────── */
      case 'sound-groups': {
        const sg = nlp?.soundGroupsTotal as Record<string, number> | undefined;
        if (sg) {
          const SG_LABELS: Record<string, string> = { szumiace: 'Szumiące', syczace: 'Syczące', nosowe: 'Nosowe', plynne: 'Płynne' };
          const data = Object.entries(sg).map(([k,v]) => ({ label: SG_LABELS[k] || k, value: v }));
          return <BarChart data={data} colorful />;
        }
        return <InfoDisplay items={[{ label: 'Profil głoskowy', value: 'dostępny per wiersz' }]} />;
      }

      /* ─── 19. semantic-fields ─────────────────────────────── */
      case 'semantic-fields': {
        if (!corpus.semanticFieldTotals) return <Pending msg="Brak danych" />;
        return (
          <TreemapChart
            data={Object.entries(corpus.semanticFieldTotals).map(([k, v]) => ({ label: FIELD_LABELS[k] || k, value: v as number }))}
          />
        );
      }

      /* ─── 20. metaphors ───────────────────────────────────── */
      case 'metaphors': {
        const mc = (corpus as any).metaphorsCorpus;
        if (!mc) return <Pending msg="Dane metafor w przygotowaniu..." />;
        return (
          <>
            <div className="mb-4">
              <div className="text-center mb-2">
                <span className="text-3xl font-bold">{mc.totalMetaphors}</span>
                <span className="text-sm opacity-40 ml-2">metafor w 310 wierszach</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest opacity-30 mb-2">Najczęstsze domeny źródłowe</p>
              <BarChart data={Object.entries(mc.topSources).slice(0, 10).map(([k, v]) => ({ label: k, value: v as number }))} colorful />
            </div>
            <div className="my-6 border-t border-ink/5 pt-6" />
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest opacity-30 mb-2">Najczęstsze domeny docelowe</p>
              <BarChart data={Object.entries(mc.topTargets).slice(0, 10).map(([k, v]) => ({ label: k, value: v as number }))} colorful />
            </div>
            <div className="my-6 border-t border-ink/5 pt-6" />
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-30 mb-2">Najczęstsze mapowania źródło → cel</p>
              <ListDisplay items={Object.entries(mc.topMappings).slice(0, 15).map(([k, v]) => ({
                primary: k.replace('→', ' → '),
                secondary: `${v}×`,
              }))} />
            </div>
          </>
        );
      }

      /* ─── 21. word-cloud ──────────────────────────────────── */
      case 'word-cloud': {
        if (!corpus.globalWordFrequencies?.length) return <Pending msg="Brak danych" />;
        return (
          <WordCloud
            words={corpus.globalWordFrequencies.slice(0, 60).map(([text, size]) => ({ text, size }))}
          />
        );
      }

      /* ─── 22. bigrams ─────────────────────────────────────── */
      case 'bigrams': {
        const bigramData = ((corpus as any).corpusBigrams || []).slice(0, 15).map(([b, c]: [string, number]) => ({ label: b, value: c }));
        return bigramData.length > 0 ? <BarChart data={bigramData} colorful /> : <Pending msg="Brak danych" />;
      }

      /* ─── 23. subject-presence ────────────────────────────── */
      case 'subject-presence': {
        const sp = (corpus as any).aiAnalysis?.subjectPresence;
        if (!sp) return <Pending msg="Dane AI w przygotowaniu..." />;
        return <PieChart data={Object.entries(sp).map(([k, v]) => ({ label: k, value: v as number }))} colorful />;
      }

      /* ─── 24. addressee ───────────────────────────────────── */
      case 'addressee': {
        const ad = (corpus as any).aiAnalysis?.addressee;
        if (!ad) return <Pending msg="Dane AI w przygotowaniu..." />;
        return <BarChart data={Object.entries(ad).map(([k, v]) => ({ label: k, value: v as number }))} colorful />;
      }

      /* ─── 25. mask-sincerity ──────────────────────────────── */
      case 'mask-sincerity': {
        const ms = (corpus as any).aiAnalysisExtended?.maskSincerity;
        if (!ms) return <Pending msg="Dane AI w przygotowaniu..." />;
        return <ScaleChart value={ms.confessionLevel} min={0} max={1} leftLabel="Maska" rightLabel="Konfesja" valueLabel={`Średnia: ${(ms.confessionLevel * 100).toFixed(0)}%`} accentColor="#c23030" />;
      }

      /* ─── 26. emotion ─────────────────────────────────────── */
      case 'emotion': {
        const em = (corpus as any).aiAnalysis?.emotion;
        if (!em) return <Pending msg="Dane AI w przygotowaniu..." />;
        const sorted = Object.entries(em).sort((a, b) => (b[1] as number) - (a[1] as number));
        return (
          <BubbleChart data={sorted.slice(0, 10).map(([k, v]) => ({ label: k, value: v as number, size: v as number, category: k }))} />
        );
      }

      /* ─── 27. autodestruction ─────────────────────────────── */
      case 'autodestruction': {
        const ad = (corpus as any).aiAnalysis?.autodestruction;
        if (!ad) return <Pending msg="Dane AI w przygotowaniu..." />;
        return <>
          <ScaleChart value={ad.level} min={0} max={1} leftLabel="Brak" rightLabel="Silna" valueLabel={`Średnia: ${(ad.level * 100).toFixed(0)}%`} accentColor="#c23030" />
          <p className="text-xs text-ink/40 mt-4 text-center">Jeśli potrzebujesz pomocy, zadzwoń: 116 123 (Telefon Zaufania)</p>
        </>;
      }

      /* ─── 28. allusions ───────────────────────────────────── */
      case 'allusions': {
        return (
          <InfoDisplay items={[
            { label: 'Aluzje literackie', value: 'dostępne per wiersz' },
            { label: 'Źródła', value: 'Biblia, Rimbaud, mitologia' },
          ]} />
        );
      }

      /* ─── 29. anaphors ────────────────────────────────────── */
      case 'anaphors': {
        const anaphorData = ((corpus as any).corpusAnaphors || []).slice(0, 15).map(([p, c]: [string, number]) => ({ label: p, value: c }));
        return anaphorData.length > 0 ? <BarChart data={anaphorData} colorful /> : <Pending msg="Brak danych" />;
      }

      /* ─── 30. influences ──────────────────────────────────── */
      case 'influences': {
        const inf = (corpus as any).aiAnalysisExtended?.intertextuality?.influences;
        if (!inf) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <BarChart data={filterByVars(Object.entries(inf).map(([k, v]) => ({ label: INFLUENCE_LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1)), value: v as number })), selectedVars)} colorful />
        );
      }

      /* ─── 31. senses ──────────────────────────────────────── */
      case 'senses': {
        const s = (corpus as any).aiAnalysis?.senses;
        if (!s) return <Pending msg="Dane AI w przygotowaniu..." />;
        const entries = filterEntries(Object.entries(s), selectedVars);
        return (
          <RadarChart axes={entries.map(([k]) => SENSE_LABELS[k] || k)} values={entries.map(([, v]) => v as number)} accentColor="#c23030" />
        );
      }

      /* ─── 32. temperature ─────────────────────────────────── */
      case 'temperature': {
        const t = (corpus as any).aiAnalysis?.temperature;
        if (!t) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <ScaleChart value={t.value} min={0} max={1} leftLabel="Zimne" rightLabel="Gorące" valueLabel={`Średnia: ${(t.value * 100).toFixed(0)}%`} accentColor="#c23030" />
        );
      }

      /* ─── 33. space ───────────────────────────────────────── */
      case 'space': {
        const sp = (corpus as any).aiAnalysisExtended?.space;
        if (!sp) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <ScaleChart value={sp.openClosedRatio} min={0} max={1} leftLabel="Zamknięta" rightLabel="Otwarta" valueLabel={`Średnia: ${(sp.openClosedRatio * 100).toFixed(0)}% otwarta`} accentColor="#c23030" />
        );
      }

      /* ─── 34. time-of-day ─────────────────────────────────── */
      case 'time-of-day': {
        const td = (corpus as any).aiAnalysisExtended?.timeOfDay;
        if (!td) return <Pending msg="Dane AI w przygotowaniu..." />;
        const periods = td.periods || {};
        const seasons = td.seasons || {};
        return <>
          <BarChart data={Object.entries(periods).map(([k, v]) => ({ label: PERIOD_LABELS[k] || k, value: v as number }))} colorful />
          <div className="mt-4 pt-4 border-t border-ink/10">
            <p className="text-xs uppercase tracking-wider text-ink/40 mb-2">Pory roku</p>
            <BarChart data={Object.entries(seasons).map(([k, v]) => ({ label: SEASON_LABELS[k] || k, value: v as number }))} colorful />
          </div>
        </>;
      }

      /* ─── 35. motion ──────────────────────────────────────── */
      case 'motion': {
        const m = (corpus as any).aiAnalysisExtended?.motion;
        if (!m) return <Pending msg="Dane AI w przygotowaniu..." />;
        return (
          <ScaleChart value={m.dynamism} min={0} max={1} leftLabel="Bezruch" rightLabel="Ruch" valueLabel={`Średnia dynamika: ${(m.dynamism * 100).toFixed(0)}%`} accentColor="#c23030" />
        );
      }

      /* ─── 36. imagery-density ─────────────────────────────── */
      case 'imagery-density': {
        const im = (corpus as any).aiAnalysisExtended?.imageryDensity;
        if (!im) return <Pending msg="Dane AI w przygotowaniu..." />;
        const density = im.per100words || 0;
        const idData = [
          { label: 'Wojaczek', value: Math.round(density * 10) / 10 },
          { label: 'Poezja PL (śr.)', value: 5 },
          { label: 'Proza PL (śr.)', value: 2 },
        ];
        return <BarChart data={idData} colorful />;
      }

      /* ─── 37. regularity ──────────────────────────────────── */
      case 'regularity': {
        if (nlp?.avgRegularityScore == null) return <Pending msg="Dane NLP korpusu niedostepne" />;
        return (
          <GaugeChart
            value={nlp.avgRegularityScore as number}
            label="Srednia regularnosc"
            minLabel="Nieregularny"
            maxLabel="Regularny"
          />
        );
      }

      /* ─── 38. strophic ────────────────────────────────────── */
      case 'strophic': {
        const strophData = [
          { label: 'Wierszy', value: corpus.totalPoems },
          { label: 'Wersów łącznie', value: corpus.totalLines },
          { label: 'Śr. długość', value: Math.round(corpus.avgPoemLength as number) },
          { label: 'Mediana', value: corpus.medianPoemLength as number },
        ];
        return <BarChart data={strophData} colorful />;
      }

      /* ─── 39. reading-tempo ───────────────────────────────── */
      case 'reading-tempo': {
        const tempo = nlp?.tempoDistribution as Record<string, number> | undefined;
        const avgSec = nlp?.avgReadingSeconds as number | undefined;
        const avgSyl = nlp?.avgSyllables as number | undefined;
        if (!tempo && avgSec == null) return <Pending msg="Dane NLP korpusu niedostepne" />;
        return (
          <>
            {tempo && (
              <BarChart
                data={Object.entries(tempo).map(([k, v]) => ({ label: TEMPO_LABELS[k] || k, value: v as number }))}
                colorful
              />
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {avgSec != null && (
                <div className="border border-ink/10 p-3 text-center">
                  <div className="text-lg font-bold">{avgSec.toFixed(0)}s</div>
                  <div className="text-[10px] opacity-40 uppercase">Sredni czas czytania</div>
                </div>
              )}
              {avgSyl != null && (
                <div className="border border-ink/10 p-3 text-center">
                  <div className="text-lg font-bold">{avgSyl.toFixed(0)}</div>
                  <div className="text-[10px] opacity-40 uppercase">Srednia sylab</div>
                </div>
              )}
            </div>
          </>
        );
      }

      /* ─── 40. fractal ──────────────────────────────────── */
      case 'fractal': {
        const fr = (corpus as any).fractal;
        if (!fr) return <Pending msg="Brak danych fraktalnych" />;
        const h = fr.corpusHurst;
        const avgH = fr.avgHurst;
        const interpretation = h > 0.7
          ? 'Cała twórczość Wojaczka wykazuje silną persystencję — zdania organizują się w spójne, powtarzalne wzorce. Struktura jest daleka od chaosu.'
          : h > 0.55
          ? 'Twórczość Wojaczka wykazuje umiarkowaną persystencję — istnieją wzorce rytmiczne, ale nie dominują. Styl balansuje między porządkiem a swobodą.'
          : 'Twórczość Wojaczka jest bliższa losowości — brak dominujących wzorców długości zdań. Każde zdanie jest niezależne od poprzedniego.';
        // Top 10 most fractal poems
        const topPoems = (fr.poemFractals || []).slice(0, 10).map((p: any) => ({
          label: p.title, value: p.hurst,
        }));
        return (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="border border-ink/10 p-5 text-center">
                <div className="text-3xl font-bold" style={{ color: '#c23030' }}>{h ?? '—'}</div>
                <div className="text-[9px] uppercase tracking-widest opacity-40 mt-1">Hurst (korpus)</div>
              </div>
              <div className="border border-ink/10 p-5 text-center">
                <div className="text-3xl font-bold">{fr.corpusDfaAlpha ?? '—'}</div>
                <div className="text-[9px] uppercase tracking-widest opacity-40 mt-1">DFA α</div>
              </div>
              <div className="border border-ink/10 p-5 text-center">
                <div className="text-3xl font-bold">{avgH ?? '—'}</div>
                <div className="text-[9px] uppercase tracking-widest opacity-40 mt-1">Śr. per wiersz</div>
              </div>
            </div>
            <ScaleChart value={h || 0.5} min={0} max={1} leftLabel="Telegraficzny" rightLabel="Narracyjny" />
            <p className="text-[12px] opacity-50 mt-4 leading-relaxed">{interpretation}</p>
            {fr.poemFractals?.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-widest opacity-30 mt-6 mb-2">Wiersze o najsilniejszej strukturze fraktalnej</p>
                <BarChart data={(fr.poemFractals as any[]).slice(0, 15).map((p: any) => ({ label: p.title, value: p.hurst }))} colorful />
                <div className="mt-3 space-y-1">
                  {(fr.poemFractals as any[]).slice(0, 20).map((p: any, i: number) => (
                    <button
                      key={p.id}
                      onClick={() => onNavigateToPoem?.(p.id)}
                      className="w-full flex items-center justify-between py-2 px-1 border-b border-ink/5 text-[12px] hover:bg-ink/3 transition-colors text-left"
                    >
                      <span className="hover:opacity-100" style={{ color: '#c23030' }}>{i + 1}. {p.title} →</span>
                      <span className="font-mono opacity-40">H = {p.hurst}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="text-[11px] opacity-40 mt-4">Przeanalizowano {fr.totalAnalyzed} z 310 wierszy (min. 8 wersów).</p>
            {/* Fractal Tree at the bottom */}
            {fr.poemFractals?.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-widest opacity-30 mt-8 mb-2">Drzewo fraktalne twórczości</p>
                <div style={{ marginTop: '-30%' }}>
                <FractalTree
                  poems={(fr.poemFractals as any[]).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    hurst: p.hurst,
                    alpha: p.alpha,
                    lines: p.lines,
                    emotion: p.emotion,
                    intensity: p.intensity,
                    wordCount: p.wordCount,
                  }))}
                  corpusHurst={h || 0.5}
                />
                </div>
                <div className="mt-4 space-y-3 border-t border-ink/10 pt-4">
                  <p className="text-[10px] uppercase tracking-widest opacity-30">Jak czytać drzewo fraktalne</p>

                  <p className="text-[12px] opacity-50 leading-relaxed">
                    Drzewo fraktalne to wizualny portret całej twórczości Wojaczka — 244 wierszy przedstawionych jako gałęzie wyrastające z jednego centrum. Każdy wiersz to osobna gałąź. Razem tworzą organiczną strukturę, która ujawnia wzorce niewidoczne w pojedynczych tekstach.
                  </p>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex gap-3 items-start">
                      <div className="w-12 h-[2px] bg-[#333] mt-2 shrink-0" />
                      <div><span className="font-medium opacity-70">Długość gałęzi</span> <span className="opacity-40">— proporcjonalna do objętości wiersza (liczba słów). Dłuższa gałąź = dłuższy wiersz.</span></div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 shrink-0 mt-1 flex gap-0.5">
                        <div className="w-[2px] h-4 bg-[#333] rotate-[-20deg]" />
                        <div className="w-[2px] h-3 bg-[#333] rotate-[-10deg]" />
                        <div className="w-[2px] h-3 bg-[#333] rotate-[10deg]" />
                      </div>
                      <div><span className="font-medium opacity-70">Rozgałęzienia na końcu</span> <span className="opacity-40">— im wyższy wykładnik Hursta (persystencja rytmu), tym więcej sub-gałęzi. Wiersz o silnej strukturze fraktalnej ma bogatsze rozgałęzienia.</span></div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-4 h-4 rounded-full shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #cc3333, #2255aa, #228877, #6644aa, #ddaa33)' }} />
                      <div><span className="font-medium opacity-70">Kolor gałęzi</span> <span className="opacity-40">— emocja dominująca wiersza, mapowana na paletę kolorów Goethego:</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-7 text-[10px]">
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#cc3333'}} /><span className="opacity-50">gniew — czerwony</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#2255aa'}} /><span className="opacity-50">smutek — niebieski</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#228877'}} /><span className="opacity-50">rezygnacja — teal</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#aa3377'}} /><span className="opacity-50">ironia — magenta</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#ddaa33'}} /><span className="opacity-50">czułość — żółty</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#6644aa'}} /><span className="opacity-50">rozpacz — fiolet</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#3366aa'}} /><span className="opacity-50">melancholia — błękit</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#4477bb'}} /><span className="opacity-50">tęsknota — jasny błękit</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#dd7722'}} /><span className="opacity-50">bunt — pomarańczowy</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 rounded" style={{background:'#886633'}} /><span className="opacity-50">obrzydzenie — brunatny</span></div>
                  </div>

                  <div className="space-y-2 text-[11px] mt-2">
                    <div className="flex gap-3 items-start">
                      <div className="w-3 h-3 rounded-full bg-[#333] shrink-0 mt-0.5 opacity-30" />
                      <div><span className="font-medium opacity-70">Grubość gałęzi</span> <span className="opacity-40">— proporcjonalna do objętości wiersza. Grubsza = więcej słów.</span></div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-3 h-3 rounded-full border border-[#ccc] shrink-0 mt-0.5" />
                      <div><span className="font-medium opacity-70">Kręgi referencyjne</span> <span className="opacity-40">— okręgi pomagają ocenić względną długość gałęzi. Nie mają jednostek — służą porównaniu.</span></div>
                    </div>
                  </div>

                  <p className="text-[11px] opacity-40 leading-relaxed mt-2">
                    Najedź kursorem na końcówkę gałęzi, żeby zobaczyć tytuł wiersza, wykładnik Hursta i emocję dominującą. Wiersze pogrupowane są kolorystycznie — sąsiednie gałęzie w tym samym kolorze to wiersze o podobnym profilu emocjonalnym.
                  </p>
                </div>
              </>
            )}
          </>
        );
      }

      default:
        return <Pending msg="Brak danych" />;
    }
  }

  return <Pending msg="Brak danych" />;
}
