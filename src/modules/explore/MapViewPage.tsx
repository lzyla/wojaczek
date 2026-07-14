/// <reference types="vite/client" />
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, Layers, ChevronRight } from 'lucide-react';
import { MAP_CENTER } from '../../constants';
import { useData } from '../../services/data/dataService';
import type { Point } from '../../types';

const getTileLayer = () => {
  return L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '',
    subdomains: 'abcd',
    maxZoom: 19,
  });
};

const createNumberedIcon = (index: number) =>
  L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    html: `<div style="width:32px;height:32px;background:#c23030;border-radius:50%;border:2px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:700;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;">${index}</div>`,
  });

interface MapViewPageProps {
  onSelectPoint: (point: Point) => void;
}

export const MapViewPage = ({ onSelectPoint }: MapViewPageProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { points } = useData();
  const [activePoint, setActivePoint] = useState<Point | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      attributionControl: false,
      zoomControl: true,
    });
    mapRef.current = map;

    getTileLayer().addTo(map);

    // Fit all points in view
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60] });

    // Trail polyline
    const coords = points.map(p => [p.lat, p.lng] as [number, number]);
    L.polyline(coords, {
      color: '#ffffff',
      weight: 2,
      dashArray: '6, 6',
      opacity: 0.6,
    }).addTo(map);

    // Add markers
    points.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: createNumberedIcon(i + 1),
      }).addTo(map);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setActivePoint(p);
        map.flyTo([p.lat, p.lng], 16, { duration: 0.8 });
      });
    });

    // Click on map background dismisses card
    map.on('click', () => {
      setActivePoint(null);
    });

    return () => { map.remove(); };
  }, []);

  return (
    <motion.div
      key="map"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10"
    >
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Active point card - WHITE background */}
      <AnimatePresence>
        {activePoint && (
          <motion.div
            key={activePoint.id}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="absolute bottom-6 left-4 right-4 z-20"
          >
            <div
              className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] overflow-hidden cursor-pointer"
              onClick={() => onSelectPoint(activePoint)}
            >
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm"
                >
                  <img
                    src={activePoint.imageUrl}
                    alt={activePoint.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="label-ui text-seal text-[8px]">{activePoint.category}</span>
                  <h3 className="text-base font-cormorant font-bold tracking-tight leading-tight mt-0.5 truncate">{activePoint.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="text-mist" />
                      <span className="label-ui text-[8px]">{activePoint.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers size={10} className="text-mist" />
                      <span className="label-ui text-[8px]">{activePoint.media?.length || 0} zasobów</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center shrink-0">
                  <ChevronRight size={18} className="text-mist" />
                </div>
              </div>

              {/* Description teaser */}
              <div className="px-4 pb-4 -mt-1">
                <p className="text-xs opacity-50 line-clamp-2 leading-relaxed">{activePoint.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
