/// <reference types="vite/client" />
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAP_CENTER } from '../../constants';
import { useData } from '../../services/data/dataService';
import { PlacePreview } from './components/PlacePreview';
import type { Point } from '../../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface TrailViewProps {
  onStart: (point: Point) => void;
}

export const TrailView = ({ onStart }: TrailViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { points } = useData();
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start end', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Compute bounds to fit all points
    const bounds = new mapboxgl.LngLatBounds();
    points.forEach(p => bounds.extend([p.lng, p.lat]));

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      bounds,
      fitBoundsOptions: { padding: 50 },
      pitch: 35,
      bearing: -15,
      interactive: true,
      attributionControl: false,
      logoPosition: 'top-left',
    });

    map.current.on('load', () => {
      const m = map.current!;

      m.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
      });
      m.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Atmospheric fog
      m.setFog({
        color: 'rgb(186, 195, 210)',
        'high-color': 'rgb(36, 50, 75)',
        'horizon-blend': 0.08,
        'space-color': 'rgb(15, 20, 35)',
        'star-intensity': 0.4,
      });

      const coords = points.map(p => [p.lng, p.lat]);
      m.addSource('trail', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        },
      });
      m.addLayer({
        id: 'trail-line',
        type: 'line',
        source: 'trail',
        paint: {
          'line-color': '#c23030',
          'line-width': 3,
          'line-dasharray': [2, 1],
          'line-opacity': 0.8,
        },
      });
    });

    points.forEach((p, i) => {
      const el = document.createElement('div');
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundColor = '#c23030';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontSize = '10px';
      el.style.fontWeight = '700';
      el.textContent = String(i + 1);

      new mapboxgl.Marker(el).setLngLat([p.lng, p.lat]).addTo(map.current!);
    });

    return () => { map.current?.remove(); };
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
            src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Miko%C5%82%C3%B3w_-_Rynek.JPG"
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
