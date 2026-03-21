export type MediaBlock =
  | { type: 'text'; content: string }
  | { type: 'photo'; url: string; caption?: string }
  | { type: 'gallery'; images: { url: string; caption?: string }[] }
  | { type: 'audio'; url: string; title?: string }
  | { type: 'video'; url: string; platform: 'youtube' | 'vimeo' }
  | { type: 'map'; lat: number; lng: number; zoom?: number }
  | { type: 'beforeAfter'; before: { url: string; label?: string }; after: { url: string; label?: string } }
  | { type: 'timeline'; events: { year: string; title: string; description: string }[] }
  | { type: 'poem'; title: string; content: string; background?: string };

export interface Point {
  id: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  audioUrl: string;
  imageUrl: string;
  duration: string;
  resourceCount?: number;
  media?: MediaBlock[];
}

export interface Poem {
  id: string;
  title: string;
  content: string;
  year?: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface Letter {
  id: string;
  to: string;
  date: string;
  excerpt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
}

export type ViewId =
  | 'intro'
  | 'list'
  | 'map'
  | 'trail'
  | 'navigation'
  | 'detail'
  | 'mockups'
  | 'biography'
  | 'reflections'
  | 'info'
  | 'poems'
  | 'gallery'
  | 'timeline'
  | 'letters';
