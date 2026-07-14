/// <reference types="vite/client" />
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER } from '../../constants';
import { useData } from '../../services/data/dataService';
import { PlacePreview } from './components/PlacePreview';
import type { Point } from '../../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const getTileLayer = () => {
  // Use CartoDB Positron — clean, light, grayscale-ish, no API key needed
  return L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '',
    subdomains: 'abcd',
    maxZoom: 19,
  });
};

const createNumberedIcon = (index: number) =>
  L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div style="width:24px;height:24px;background:#c23030;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;">${index}</div>`,
  });

interface TrailViewProps {
  onStart: (point: Point) => void;
}

export const TrailView = ({ onStart }: TrailViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { points } = useData();
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start end', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      attributionControl: false,
      zoomControl: true,
    });
    mapRef.current = map;

    getTileLayer().addTo(map);

    // Fit bounds to all points
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50] });

    // Trail polyline
    const coords = points.map(p => [p.lat, p.lng] as [number, number]);
    L.polyline(coords, {
      color: '#c23030',
      weight: 3,
      dashArray: '8, 4',
      opacity: 0.8,
    }).addTo(map);

    // Markers
    points.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: createNumberedIcon(i + 1),
      }).addTo(map);

      marker.on('click', () => {
        setPreviewPoint(p);
      });
    });

    // Fix tile rendering on mobile
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 500);

    return () => { map.remove(); };
  }, []);

  return (
    <motion.div
      key="trail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Map + overlapping image */}
      <div className="relative -mx-8 mb-0">
        {/* Map */}
        <div className="h-80 overflow-hidden">
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Gradient fade at bottom of map */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-paper/60 to-transparent pointer-events-none z-10" />

        {/* Featured image slightly overlapping map - parallax */}
        <div
          ref={heroRef}
          className="relative -mt-4 mx-6 rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.18)] z-20"
        >
          <motion.img
            src="/images/rynek-panorama.jpg"
            alt="Ścieżka Wojaczka"
            className="w-full aspect-[3/2] object-cover grayscale contrast-125 brightness-75 scale-110"
            style={{ y: heroY }}
            referrerPolicy="no-referrer"
          />
          {/* Subtle dark gradient overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Clickable place list */}
      <div className="space-y-0 mt-8">
        {points.map((p, i) => (
          <div
            key={p.id}
            onClick={() => setPreviewPoint(p)}
            className="flex items-center gap-5 py-5 border-b border-mist-light/60 last:border-0 cursor-pointer group"
          >
            {/* Animated circle with number - fast pop */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1 + i * 0.04,
                type: 'spring',
                stiffness: 400,
                damping: 15,
              }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full border-2 border-ink flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)] group-hover:bg-ink group-hover:text-white group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300"
            >
              <span className="text-[13px] font-semibold leading-none" style={{ fontFamily: 'var(--font-dm)' }}>{i + 1}</span>
            </motion.div>
            <div className="flex-1">
              <span className="text-sm font-medium group-hover:text-seal transition-colors">{p.title}</span>
              <span className="label-ui text-[8px] text-mist-dark ml-3">{p.category}</span>
            </div>
            <span className="text-xs text-mist-dark opacity-0 group-hover:opacity-70 transition-all duration-300">
              Podgląd →
            </span>
          </div>
        ))}
      </div>

      {/* Start button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-4 pb-12"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{ backgroundColor: 'rgba(10, 10, 10, 0.85)' }}
          onClick={() => onStart(points[0])}
          className="w-full py-4 bg-ink text-white label-ui no-radius transition-colors"
        >
          Rozpocznij
        </motion.button>
      </motion.div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewPoint && (
          <PlacePreview
            point={previewPoint}
            onClose={() => setPreviewPoint(null)}
            onNavigate={() => {
              setPreviewPoint(null);
              onStart(previewPoint);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
