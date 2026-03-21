/// <reference types="vite/client" />
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Play, Pause } from 'lucide-react';
import type { MediaBlock } from '../../../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const TextBlock = ({ content }: { content: string }) => (
  <div className="py-2">
    <p className="text-literary text-sm leading-relaxed">{content}</p>
  </div>
);

const PhotoBlock = ({ url, caption }: { url: string; caption?: string }) => (
  <div>
    <div className="aspect-[4/3] rounded-xl overflow-hidden">
      <img src={url} alt={caption || ''} className="w-full h-full object-cover grayscale contrast-125 brightness-90" referrerPolicy="no-referrer" />
    </div>
    {caption && <p className="label-ui text-mist-dark mt-3">{caption}</p>}
  </div>
);

const GalleryBlock = ({ images }: { images: { url: string; caption?: string }[] }) => (
  <div className="grid grid-cols-2 gap-3">
    {images.map((img, i) => (
      <div key={i} className="aspect-square rounded-lg overflow-hidden">
        <img src={img.url} alt={img.caption || ''} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
      </div>
    ))}
  </div>
);

const AudioBlock = ({ url, title }: { url: string; title?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener('timeupdate', () => {
        const a = audioRef.current!;
        setProgress(a.duration ? a.currentTime / a.duration : 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="border border-ink/10 p-5 no-radius">
      {title && <span className="label-ui opacity-50 block mb-4">{title}</span>}
      <div className="flex items-center gap-6">
        <button onClick={togglePlay} className="w-10 h-10 btn-square no-radius shrink-0">
          {isPlaying ? <Pause size={16} strokeWidth={1} /> : <Play size={16} strokeWidth={1} />}
        </button>
        <div className="flex-1">
          <div className="h-[1px] bg-ink/10 w-full relative">
            <div className="absolute h-[1px] bg-ink left-0 top-0" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoBlock = ({ url }: { url: string }) => (
  <div className="aspect-video no-radius overflow-hidden border border-ink/5">
    <iframe src={url} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
  </div>
);

const MapBlock = ({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) => {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!container.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/light-v11',
      logoPosition: 'top-left' as const,
      center: [lng, lat],
      zoom: zoom || 17,
      pitch: 45,
      interactive: false,
      attributionControl: false,
    });

    map.current.on('load', () => {
      map.current?.setFog({
        color: 'rgb(186, 195, 210)',
        'high-color': 'rgb(36, 50, 75)',
        'horizon-blend': 0.06,
        'space-color': 'rgb(15, 20, 35)',
        'star-intensity': 0.3,
      });
    });

    const el = document.createElement('div');
    el.style.cssText = 'width:14px;height:14px;background:#c23030;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)';
    new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);

    return () => { map.current?.remove(); };
  }, [lat, lng, zoom]);

  return <div ref={container} className="h-64 w-full rounded-xl overflow-hidden" />;
};

const BeforeAfterBlock = ({ before, after }: { before: { url: string; label?: string }; after: { url: string; label?: string } }) => {
  const [showAfter, setShowAfter] = useState(false);

  return (
    <div>
      <div className="relative aspect-[4/3] no-radius overflow-hidden border border-ink/5">
        <img
          src={showAfter ? after.url : before.url}
          alt={showAfter ? after.label || 'Po' : before.label || 'Przed'}
          className={`w-full h-full object-cover transition-all duration-500 ${!showAfter ? 'grayscale' : ''}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 left-0 right-0 flex">
          <button
            onClick={() => setShowAfter(false)}
            className={`flex-1 py-3 text-center label-ui text-[8px] transition-all ${!showAfter ? 'bg-ink text-white' : 'bg-white/80 text-ink'}`}
          >
            {before.label || 'Przed'}
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={`flex-1 py-3 text-center label-ui text-[8px] transition-all ${showAfter ? 'bg-ink text-white' : 'bg-white/80 text-ink'}`}
          >
            {after.label || 'Po'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TimelineBlock = ({ events }: { events: { year: string; title: string; description: string }[] }) => (
  <div className="border-l-2 border-ink/10 pl-6 space-y-8">
    {events.map((event, i) => (
      <div key={i}>
        <span className="label-ui text-seal">{event.year}</span>
        <h4 className="text-lg mt-1 font-bold">{event.title}</h4>
        <p className="text-sm opacity-60 mt-1">{event.description}</p>
      </div>
    ))}
  </div>
);

const PoemBlock = ({ title, content, background }: { title: string; content: string; background?: string }) => (
  <div className="p-8 no-radius" style={{ backgroundColor: background || '#1a1a1a', color: '#ffffff' }}>
    <span className="label-ui opacity-50 block mb-6">{title}</span>
    <p className="text-literary text-sm leading-loose whitespace-pre-line italic opacity-90">
      {content}
    </p>
  </div>
);

export const MediaBlockRenderer = ({ block }: { block: MediaBlock }) => {
  switch (block.type) {
    case 'text': return <TextBlock content={block.content} />;
    case 'photo': return <PhotoBlock url={block.url} caption={block.caption} />;
    case 'gallery': return <GalleryBlock images={block.images} />;
    case 'audio': return <AudioBlock url={block.url} title={block.title} />;
    case 'video': return <VideoBlock url={block.url} />;
    case 'map': return <MapBlock lat={block.lat} lng={block.lng} zoom={block.zoom} />;
    case 'beforeAfter': return <BeforeAfterBlock before={block.before} after={block.after} />;
    case 'timeline': return <TimelineBlock events={block.events} />;
    case 'poem': return <PoemBlock title={block.title} content={block.content} background={block.background} />;
    default: return null;
  }
};
