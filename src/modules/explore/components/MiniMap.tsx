/// <reference types="vite/client" />
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MiniMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  interactive?: boolean;
}

export const MiniMap = ({ lat, lng, zoom = 16, interactive = false }: MiniMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      logoPosition: 'top-left' as const,
      center: [lng, lat],
      zoom,
      pitch: 45,
      bearing: -10,
      interactive,
      attributionControl: false,
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
        'horizon-blend': 0.06,
        'space-color': 'rgb(15, 20, 35)',
        'star-intensity': 0.3,
      });
    });

    // Marker
    const el = document.createElement('div');
    el.style.width = '14px';
    el.style.height = '14px';
    el.style.backgroundColor = '#c23030';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';

    new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);

    return () => { map.current?.remove(); };
  }, [lat, lng, zoom, interactive]);

  return <div ref={mapContainer} className="h-48 w-full overflow-hidden" />;
};
