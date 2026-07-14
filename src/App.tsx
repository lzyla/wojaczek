import { useState, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { useNavigation } from './hooks/useNavigation';
import { useGeminiKey } from './hooks/useGeminiKey';
import { useAiReflection } from './hooks/useAiReflection';
import { GridOverlay } from './components/GridOverlay';
import { Header } from './components/Header';
import { MenuOverlay } from './components/MenuOverlay';
import { IntroView } from './modules/intro/IntroView';
import { ListView } from './modules/explore/ListView';
import { MapViewPage } from './modules/explore/MapViewPage';
import { DetailView } from './modules/explore/DetailView';
import { ArView } from './modules/explore/ArView';
import { TrailView } from './modules/explore/TrailView';
import { NavigationView } from './modules/explore/NavigationView';
import { BiographyView } from './modules/biography/BiographyView';
import { TimelineView } from './modules/biography/TimelineView';
import { PoemsView } from './modules/literature/PoemsView';
import { LettersView } from './modules/literature/LettersView';
import { GalleryView } from './modules/gallery/GalleryView';
import { ReflectionsView } from './modules/gallery/ReflectionsView';
import { MockupsView } from './modules/gallery/MockupsView';
import { InfoView } from './modules/info/InfoView';
import { GeneratePage } from './modules/generate/GeneratePage';
import { InterpretationsPage } from './modules/interpretations/InterpretationsPage';
import { DataMiningPage } from './modules/datamining/DataMiningPage';
import { useData } from './services/data/dataService';

export default function App() {
  const { view, selectedPoint, scrollRef, navigateTo, selectPoint, setPoint } = useNavigation();
  const { hasKey, openKeyDialog, checkAndPromptKey, markKeyMissing } = useGeminiKey();
  const { aiReflection, aiImage, isGenerating, generate, reset } = useAiReflection(checkAndPromptKey, markKeyMissing);
  const { points } = useData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnTrail, setIsOnTrail] = useState(false);
  const [initialPoemId, setInitialPoemId] = useState<string | undefined>();

  const handlePointSelect = (p: Parameters<typeof selectPoint>[0]) => {
    reset();
    selectPoint(p);
  };

  // When user reaches a point during navigation → open detail
  const handlePointReached = useCallback((p: Parameters<typeof selectPoint>[0]) => {
    reset();
    selectPoint(p);
  }, [reset, selectPoint]);

  // After closing detail view during trail → navigate to next point
  const handleDetailClose = useCallback(() => {
    if (!isOnTrail || !selectedPoint) {
      navigateTo('list');
      return;
    }

    const currentIndex = points.findIndex(p => p.id === selectedPoint.id);
    const nextIndex = currentIndex + 1;

    if (nextIndex < points.length) {
      // Go to next place
      const nextPoint = points[nextIndex];
      reset();
      setPoint(nextPoint);
      navigateTo('navigation');
    } else {
      // Trail complete
      setIsOnTrail(false);
      navigateTo('list');
    }
  }, [isOnTrail, selectedPoint, points, navigateTo, reset, setPoint]);

  // Start trail → set flag and navigate to first point
  const handleStartTrail = useCallback((p: Parameters<typeof setPoint>[0]) => {
    setIsOnTrail(true);
    reset();
    setPoint(p);
    navigateTo('navigation');
  }, [reset, setPoint, navigateTo]);

  return (
    <div className="relative w-full max-w-md mx-auto bg-white overflow-hidden flex flex-col no-radius sm:border-x sm:border-ink/5 sm:shadow-2xl" style={{ height: '100dvh' }}>
      <GridOverlay />
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={navigateTo} />

{/* vertical label removed for mobile */}

      <Header onLogoClick={() => navigateTo('list')} onMenuClick={() => setIsMenuOpen(true)} />

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-8 pt-12 pb-12 relative z-10 scrollbar-hide">
        <AnimatePresence mode="wait">
          {view === 'intro' && <IntroView onStart={() => navigateTo('list')} />}
          {view === 'list' && <ListView onSelectPoint={handlePointSelect} onShowMockups={() => navigateTo('mockups')} onNavigate={navigateTo} />}
          {view === 'trail' && <TrailView onStart={handleStartTrail} />}
          {view === 'navigation' && selectedPoint && (
            <NavigationView
              targetPoint={selectedPoint}
              onClose={() => { setIsOnTrail(false); navigateTo('trail'); }}
              onPointReached={handlePointReached}
            />
          )}
          {view === 'map' && <MapViewPage onSelectPoint={handlePointSelect} />}
          {view === 'detail' && selectedPoint && (
            <DetailView
              point={selectedPoint}
              aiReflection={aiReflection}
              aiImage={aiImage}
              isGenerating={isGenerating}
              hasGeminiKey={hasKey}
              onBack={handleDetailClose}
              onGenerate={() => generate(selectedPoint)}
              onOpenKeyDialog={openKeyDialog}
              onSelectPoint={handlePointSelect}
              onOpenAr={() => navigateTo('ar')}
            />
          )}
          {view === 'ar' && selectedPoint && (
            <ArView
              point={selectedPoint}
              onBack={() => navigateTo('detail')}
            />
          )}
          {view === 'biography' && <BiographyView />}
          {view === 'timeline' && <TimelineView />}
          {view === 'poems' && <PoemsView initialPoemId={initialPoemId} />}
          {view === 'letters' && <LettersView />}
          {view === 'gallery' && <GalleryView />}
          {view === 'reflections' && <ReflectionsView />}
          {view === 'mockups' && (
            <MockupsView
              hasGeminiKey={hasKey}
              onBack={() => navigateTo('list')}
              onOpenKeyDialog={openKeyDialog}
              onKeyMissing={markKeyMissing}
            />
          )}
          {view === 'info' && <InfoView />}
          {view === 'generate' && <GeneratePage />}
          {view === 'interpretations' && <InterpretationsPage />}
          {view === 'datamining' && <DataMiningPage onNavigateToPoem={(poemId) => { setInitialPoemId(poemId); navigateTo('poems'); }} />}
        </AnimatePresence>
      </main>

    </div>
  );
}
