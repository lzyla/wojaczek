import { useState, useCallback, useRef, useEffect } from 'react';
import type { ViewId, Point } from '../types';
import * as nav from '../services/navigation/navigationService';

const VIEW_STORAGE_KEY = 'wojaczek_current_view';
const STANDALONE_VIEWS = new Set<ViewId>([
  'intro',
  'list',
  'map',
  'trail',
  'mockups',
  'biography',
  'reflections',
  'info',
  'poems',
  'gallery',
  'timeline',
  'letters',
  'generate',
  'interpretations',
  'datamining',
]);

function getPersistedView(): ViewId {
  try {
    const stored = sessionStorage.getItem(VIEW_STORAGE_KEY);
    if (stored && STANDALONE_VIEWS.has(stored as ViewId)) return stored as ViewId;
  } catch {}
  return 'intro';
}

export function useNavigation() {
  const [state, setState] = useState(() => ({
    ...nav.createInitialState(),
    currentView: getPersistedView(),
  }));
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist view to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(VIEW_STORAGE_KEY, state.currentView);
    } catch {}
  }, [state.currentView]);

  const navigateTo = useCallback((to: ViewId) => {
    setState(prev => nav.navigate(prev, to));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const goBack = useCallback(() => {
    setState(prev => nav.goBack(prev));
  }, []);

  const selectPoint = useCallback((point: Point) => {
    setSelectedPoint(point);
    setState(prev => nav.navigate(prev, 'detail'));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const setPoint = useCallback((point: Point) => {
    setSelectedPoint(point);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  return {
    view: state.currentView,
    selectedPoint,
    scrollRef,
    navigateTo,
    goBack,
    selectPoint,
    setPoint,
  };
}
