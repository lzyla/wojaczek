import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Point, Poem, GalleryImage, TimelineEvent, Letter } from '../../types';
import { POINTS, POEMS, GALLERY_IMAGES, TIMELINE_EVENTS, LETTERS } from '../../constants';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface DataState {
  points: Point[];
  poems: Poem[];
  gallery: GalleryImage[];
  timeline: TimelineEvent[];
  letters: Letter[];
}

interface DataContextValue extends DataState {
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextValue | null>(null);

const FALLBACK_DATA: DataState = {
  points: POINTS,
  poems: POEMS,
  gallery: GALLERY_IMAGES,
  timeline: TIMELINE_EVENTS,
  letters: LETTERS,
};

async function fetchJSON<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}/${endpoint}/`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    // If no API URL configured, use local data immediately (PWA/offline mode)
    if (!apiUrl) {
      setData(FALLBACK_DATA);
      setLoading(false);
      return;
    }

    Promise.all([
      fetchJSON<Point[]>('points'),
      fetchJSON<Poem[]>('poems'),
      fetchJSON<GalleryImage[]>('gallery'),
      fetchJSON<TimelineEvent[]>('timeline'),
      fetchJSON<Letter[]>('letters'),
    ])
      .then(([points, poems, gallery, timeline, letters]) => {
        setData({
          points: points.map(p => ({ ...p, id: String(p.id) })),
          poems: poems.map(p => ({ ...p, id: String(p.id) })),
          gallery: gallery.map(g => ({ ...g, id: String(g.id) })),
          timeline,
          letters: letters.map(l => ({ ...l, id: String(l.id) })),
        });
      })
      .catch(() => {
        setData(FALLBACK_DATA);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin mx-auto" />
          <p className="label-ui text-mist">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-white p-8">
        <div className="text-center space-y-4">
          <p className="text-lg font-cormorant font-bold">Błąd połączenia</p>
          <p className="text-sm opacity-60">{error || 'Nie udało się załadować danych'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-ink text-white label-ui"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ ...data, loading: false, error: null }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
