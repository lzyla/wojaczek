import { List, Map as MapIcon } from 'lucide-react';
import type { ViewId } from '../types';

interface BottomNavProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export const BottomNav = ({ activeView, onNavigate }: BottomNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-ink/20 grid grid-cols-2 h-20 z-50 no-radius">
    <button
      onClick={() => onNavigate('list')}
      className={`flex flex-col items-center justify-center gap-2 transition-colors ${activeView === 'list' ? 'text-seal' : 'text-ink/30'}`}
    >
      <List size={20} strokeWidth={1.5} />
      <span className="label-ui text-[8px]">Eksploracja</span>
    </button>
    <button
      onClick={() => onNavigate('map')}
      className={`flex flex-col items-center justify-center gap-2 transition-colors ${activeView === 'map' ? 'text-seal' : 'text-ink/30'}`}
    >
      <MapIcon size={20} strokeWidth={1.5} />
      <span className="label-ui text-[8px]">Mapa</span>
    </button>
  </nav>
);
