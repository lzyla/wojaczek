/// <reference types="vite/client" />
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, MapPin, X, Locate } from 'lucide-react';
import { useData } from '../../services/data/dataService';
import type { Point } from '../../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
const PROXIMITY_THRESHOLD_METERS = 50;

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface NavigationViewProps {
  targetPoint: Point;
  onClose: () => void;
  onPointReached: (point: Point) => void;
}

const FallbackMap = ({ targetPoint, onClose }: { targetPoint: Point; onClose: () => void }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-8 text-center">
    <MapPin size={48} className="text-seal mb-6" />
    <h2 className="text-2xl font-cormorant font-bold mb-4">{targetPoint.title}</h2>
    <p className="text-sm opacity-60 mb-8">Brak tokenu Mapbox. Dodaj VITE_MAPBOX_TOKEN do pliku .env</p>
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${targetPoint.lat},${targetPoint.lng}&travelmode=walking`}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full py-4 bg-ink text-white label-ui no-radius mb-4 block text-center"
    >
      Otwórz w Google Maps
    </a>
    <button onClick={onClose} className="w-full py-4 btn-square no-radius label-ui">Zamknij</button>
  </div>
);

export const NavigationView = ({ targetPoint, onClose, onPointReached }: NavigationViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);
  const { points } = useData();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [targetPoint.lng, targetPoint.lat],
      zoom: 15.5,
      pitch: 60,
      bearing: -20,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: false }), 'top-right');

    map.current.on('load', () => {
      const m = map.current!;

      // 3D terrain
      m.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
      });
      m.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // 3D buildings
      m.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.5,
        },
      });

      // Trail line connecting all points
      const allCoords = points.map(p => [p.lng, p.lat]);
      m.addSource('trail', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: allCoords },
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
          'line-opacity': 0.5,
        },
      });
    });

    // Target marker (big red)
    const targetEl = document.createElement('div');
    targetEl.style.cssText = 'width:28px;height:28px;background:#c23030;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.5);';
    new mapboxgl.Marker(targetEl).setLngLat([targetPoint.lng, targetPoint.lat]).addTo(map.current);

    // Other points (small)
    points.filter(p => p.id !== targetPoint.id).forEach(p => {
      const el = document.createElement('div');
      el.style.cssText = 'width:14px;height:14px;background:rgba(255,255,255,0.7);border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);';
      new mapboxgl.Marker(el).setLngLat([p.lng, p.lat]).addTo(map.current!);
    });

    return () => { map.current?.remove(); };
  }, [targetPoint.id]);

  // Handle location update
  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    const loc = { lat, lng };
    setUserLocation(loc);
    setLocationError(false);

    const dist = getDistanceMeters(loc.lat, loc.lng, targetPoint.lat, targetPoint.lng);
    setDistance(Math.round(dist));

    if (map.current) {
      if (!userMarker.current) {
        const el = document.createElement('div');
        el.style.cssText = 'width:16px;height:16px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5);';
        userMarker.current = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);
      } else {
        userMarker.current.setLngLat([lng, lat]);
      }
    }

    if (dist <= PROXIMITY_THRESHOLD_METERS) {
      onPointReached(targetPoint);
    }
  }, [targetPoint, onPointReached]);

  // Watch user location — Web Geolocation API
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => handleLocationUpdate(pos.coords.latitude, pos.coords.longitude),
      () => setLocationError(true),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [targetPoint, onPointReached, handleLocationUpdate]);

  if (!MAPBOX_TOKEN) {
    return <FallbackMap targetPoint={targetPoint} onClose={onClose} />;
  }

  return (
    <motion.div
      key="navigation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50"
    >
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Close button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center"
        >
          <X size={18} />
        </button>
      </div>

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-white/30 p-6 z-10 shadow-2xl rounded-t-2xl">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-seal/10 rounded-full flex items-center justify-center">
            <Navigation size={18} className="text-seal" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">{targetPoint.title}</h3>
            <p className="label-ui text-[8px] opacity-50">
              {targetPoint.category} — Miejsce {points.findIndex(p => p.id === targetPoint.id) + 1} z {points.length}
            </p>
          </div>
          {distance !== null && (
            <span className="label-ui text-seal">
              {distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`}
            </span>
          )}
        </div>

        {locationError && (
          <p className="text-xs opacity-50 flex items-center gap-2">
            <Locate size={12} />
            Włącz lokalizację, aby zobaczyć trasę
          </p>
        )}

        {!locationError && !userLocation && (
          <p className="text-xs opacity-50 animate-pulse">Szukam lokalizacji...</p>
        )}

        {distance !== null && distance <= PROXIMITY_THRESHOLD_METERS && (
          <button
            onClick={() => onPointReached(targetPoint)}
            className="w-full py-3 bg-seal text-white label-ui no-radius mt-3"
          >
            Jesteś na miejscu — otwórz
          </button>
        )}
      </div>
    </motion.div>
  );
};
