/// <reference types="vite/client" />
import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getTileLayer = () => {
  return L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '',
    subdomains: 'abcd',
    maxZoom: 19,
  });
};

const markerIcon = L.divIcon({
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  html: '<div style="width:14px;height:14px;background:#c23030;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
});

interface MiniMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  interactive?: boolean;
}

export const MiniMap = ({ lat, lng, zoom = 16, interactive = false }: MiniMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      attributionControl: false,
      zoomControl: false,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    });
    mapRef.current = map;

    map.setView([lat, lng], zoom);
    getTileLayer().addTo(map);

    L.marker([lat, lng], { icon: markerIcon }).addTo(map);

    return () => { map.remove(); };
  }, [lat, lng, zoom, interactive]);

  return <div ref={mapContainer} className="h-48 w-full overflow-hidden" />;
};
