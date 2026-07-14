import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { AnalysisType, AnalysisMode, AnalysisCategory } from './types';
import { ANALYSIS_CATEGORIES } from './constants';
import { loadCorpusAnalysis } from './analysisService';
import { ModeToggle } from './components/ModeToggle';
import { CategorySection } from './components/CategorySection';
import { PoemPickerView } from './PoemPickerView';
import { AnalysisDetailView } from './AnalysisDetailView';

type SubView = 'home' | 'category' | 'picker' | 'detail';

export const DataMiningPage = ({ onNavigateToPoem }: { onNavigateToPoem?: (poemId: string) => void } = {}) => {
  const [mode, setMode] = useState<AnalysisMode>('corpus');
  const [activeCategory, setActiveCategory] = useState<AnalysisCategory | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType | null>(null);
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);
  const [poemIndex, setPoemIndex] = useState<{ id: string; title: string }[]>([]);
  const [subView, setSubView] = useState<SubView>('home');

  useEffect(() => {
    loadCorpusAnalysis()
      .then((data) => setPoemIndex(data.poemIndex))
      .catch(() => {});
  }, []);

  const handleSelectCategory = (cat: AnalysisCategory) => {
    setActiveCategory(cat);
    setSubView('category');
  };

  const handleSelectAnalysis = (analysis: AnalysisType) => {
    if (!analysis.modes.includes(mode)) {
      setMode(analysis.modes[0]);
    }
    setSelectedAnalysis(analysis);
    setSelectedPoemId(null);

    const effectiveMode = analysis.modes.includes(mode) ? mode : analysis.modes[0];
    if (effectiveMode === 'poem') {
      setSubView('picker');
    } else {
      setSubView('detail');
    }
  };

  const handleBackFromCategory = () => {
    setActiveCategory(null);
    setSubView('home');
  };

  const handleBackFromPicker = () => {
    setSelectedAnalysis(null);
    setSubView('category');
  };

  const handleBackFromDetail = () => {
    if (mode === 'poem' && selectedPoemId) {
      setSelectedPoemId(null);
      setSubView('picker');
    } else {
      setSelectedAnalysis(null);
      setSubView('category');
    }
  };

  const handleSelectPoem = (id: string) => {
    setSelectedPoemId(id);
    setSubView('detail');
  };

  const filteredAnalyses = activeCategory
    ? activeCategory.analyses.filter((a) => a.modes.includes(mode))
    : [];

  return (
    <motion.div
      key="datamining"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="datamining-color"
    >
      <AnimatePresence mode="wait">
        {/* HOME — typographic category list */}
        {subView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mt-8 mb-10">
              <h1 className="text-3xl font-cormorant font-bold tracking-tight leading-none">
                Eksploracja
              </h1>
              <p className="text-sm opacity-40 mt-2 max-w-[50ch]">
                310 wierszy Rafała Wojaczka przeanalizowanych algorytmicznie i przez sztuczną inteligencję.
              </p>
            </div>

            {/* Mode toggle */}
            <div className="mb-8">
              <ModeToggle mode={mode} onChange={setMode} />
            </div>

            {/* Category list — typographic, like table of contents */}
            <div className="space-y-0">
              {ANALYSIS_CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="w-full text-left py-5 border-b border-ink/8 group flex items-start justify-between gap-4 hover:bg-ink/[0.02] transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[11px] font-mono opacity-25 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h2 className="text-lg font-semibold tracking-tight group-hover:text-[#c23030] transition-colors">
                        {cat.label}
                      </h2>
                    </div>
                    <p className="text-[13px] opacity-40 mt-1 ml-8 leading-relaxed">
                      {cat.description}
                    </p>
                    <p className="text-[11px] opacity-25 mt-1.5 ml-8 font-mono">
                      {cat.analyses.length} {cat.analyses.length === 1 ? 'analiza' : cat.analyses.length < 5 ? 'analizy' : 'analiz'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="opacity-20 group-hover:opacity-50 mt-1.5 shrink-0 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* CATEGORY — list of analyses */}
        {subView === 'category' && activeCategory && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={handleBackFromCategory}
              className="text-sm opacity-40 hover:opacity-70 transition-opacity mb-4 mt-4 flex items-center gap-1"
            >
              ← Eksploracja
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-cormorant font-bold tracking-tight">
                {activeCategory.label}
              </h2>
              <p className="text-sm opacity-40 mt-1">
                {activeCategory.description}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="mb-6">
              <ModeToggle mode={mode} onChange={setMode} />
            </div>

            {/* Analysis cards */}
            {filteredAnalyses.length > 0 ? (
              <CategorySection
                category={{ ...activeCategory, analyses: filteredAnalyses }}
                onSelect={handleSelectAnalysis}
              />
            ) : (
              <p className="text-sm opacity-40 text-center py-8">
                Brak analiz w tym trybie.
              </p>
            )}
          </motion.div>
        )}

        {/* PICKER — poem selection */}
        {subView === 'picker' && selectedAnalysis && (
          <PoemPickerView
            key="picker"
            poems={poemIndex}
            onSelect={handleSelectPoem}
            onBack={handleBackFromPicker}
          />
        )}

        {/* DETAIL — visualization */}
        {subView === 'detail' && selectedAnalysis && (
          <AnalysisDetailView
            key="detail"
            analysis={selectedAnalysis}
            mode={mode}
            poemId={selectedPoemId ?? undefined}
            onBack={handleBackFromDetail}
            onSelectPoem={(id) => {
              setMode('poem');
              setSelectedPoemId(id);
            }}
            onNavigateToPoem={onNavigateToPoem}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
