/// <reference types="vite/client" />
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Clock, Layers, ChevronRight } from 'lucide-react';
import { MAP_CENTER } from '../../constants';
import { useData } from '../../services/data/dataService';
import type { Point } from '../../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapViewPageProps {
  onSelectPoint: (point: Point) => void;
}

export const MapViewPage = ({ onSelectPoint }: MapViewPageProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { points } = useData();
  const [activePoint, setActivePoint] = useState<Point | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Fit all points in view
    const bounds = new mapboxgl.LngLatBounds();
    points.forEach(p => bounds.extend([p.lng, p.lat]));

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      bounds,
      fitBoundsOptions: { padding: 60 },
      pitch: 50,
      bearing: -15,
      attributionControl: false,
      logoPosition: 'top-left',
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: false }), 'top-right');

    map.current.on('load', () => {
      const m = map.current!;

      m.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
      });
      m.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Atmospheric fog with blue-gray tint
      m.setFog({
        color: 'rgb(186, 195, 210)',
        'high-color': 'rgb(36, 50, 75)',
        'horizon-blend': 0.08,
        'space-color': 'rgb(15, 20, 35)',
        'star-intensity': 0.4,
      });

      // 3D buildings
      const layers = m.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer: any) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;
      m.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#c8cdd6',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.5,
          },
        },
        labelLayerId
      );

      // Trail line
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
          'line-color': '#ffffff',
          'line-width': 2,
          'line-dasharray': [2, 2],
          'line-opacity': 0.6,
        },
      });
    });

    // Add markers
    points.forEach((p, i) => {
      const el = document.createElement('div');
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundColor = '#c23030';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontSize = '12px';
      el.style.fontWeight = '700';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s, box-shadow 0.2s';
      el.textContent = String(i + 1);

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.15)';
        el.style.boxShadow = '0 4px 20px rgba(194,48,48,0.5)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setActivePoint(p);
        map.current?.flyTo({
          center: [p.lng, p.lat],
          zoom: 16.5,
          pitch: 55,
          duration: 800,
        });
      });

      new mapboxgl.Marker(el).setLngLat([p.lng, p.lat]).addTo(map.current!);
    });

    // Click on map background dismisses card
    map.current.on('click', () => {
      setActivePoint(null);
    });

    return () => { map.current?.remove(); };
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
