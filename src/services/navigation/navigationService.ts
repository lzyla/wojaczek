import type { ViewId } from '../../types';

export interface NavigationState {
  currentView: ViewId;
  history: ViewId[];
}

export function createInitialState(): NavigationState {
  return {
    currentView: 'intro',
    history: [],
  };
}

export function navigate(state: NavigationState, to: ViewId): NavigationState {
  return {
    currentView: to,
    history: [...state.history, state.currentView],
  };
}

export function goBack(state: NavigationState): NavigationState {
  const history = [...state.history];
  const previousView = history.pop() || 'list';
  return {
    currentView: previousView,
    history,
  };
}
