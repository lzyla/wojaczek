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

export interface ArExperience {
  title: string;
  hint: string;
  anchorLabel: string;
  lines: string[];
  activationRadiusMeters?: number;
  accentColor?: string;
}

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
  arExperience?: ArExperience;
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
  | 'ar'
  | 'mockups'
  | 'biography'
  | 'reflections'
  | 'info'
  | 'poems'
  | 'gallery'
  | 'timeline'
  | 'letters'
  | 'generate'
  | 'interpretations'
  | 'interpret-poem'
  | 'interpret-detail'
  | 'datamining';

// ── Interpretation types ──

/** Reading aspect tag — what angle the annotation uses */
export type ReadingAspect =
  | 'słowo'          // etymology, polysemy, phonology of a word
  | 'forma'          // rhythm, enjambment, syntax, composition
  | 'obraz'          // imagery, metaphor, metonymy
  | 'ciało'          // body, senses, phenomenology
  | 'biografia'      // biographical context
  | 'intertekst'     // dialogue with other texts
  | 'kontekst'       // historical, social, political
  | 'afekt'          // emotion, affect, reader experience
  | 'napięcie'       // contradiction, irony, tension
  | 'porównanie';    // comparison with other poets/works

export interface AnnotationNode {
  node_id: string;
  aspect: ReadingAspect;
  phrase?: string;            // specific word/phrase being annotated (if not whole verse)
  comment: string;            // 2-4 sentences visible between verses
  full_analysis: string;      // deep analysis (multiple paragraphs)
  connects_to: string[];      // node_ids this connects to
  contradicts?: string;       // node_id of opposing reading
  contradiction_reason?: string;
  alt_readings?: string[];    // 1-sentence alternative readings
}

export interface AnnotatedVerse {
  text: string;
  annotations: AnnotationNode[];
}

export interface PoemNetwork {
  poem_id: string;
  verses: AnnotatedVerse[];
  network_summary: string;
  generated_at?: string;
}

export interface InterpretationPoem {
  id: string;
  title: string;
  content: string;
  year?: string;
  file: string;
}
