import { useState, useCallback, useRef } from 'react';
import type { ViewId, Point } from '../types';
import * as nav from '../services/navigation/navigationService';

export function useNavigation() {
  const [state, setState] = useState(nav.createInitialState());
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const navigateTo = useCallback((to: ViewId) => {
    setState(prev => nav.navigate(prev, to));
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
