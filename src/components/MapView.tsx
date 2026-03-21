import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { TILE_URL, TILE_ATTRIBUTION, customIcon, MAP_CENTER, MAP_ZOOM } from '../services/map/mapService';
import { useData } from '../services/data/dataService';
import type { Point } from '../types';

interface MapViewProps {
  onSelectPoint: (point: Point) => void;
}

export const MapView = ({ onSelectPoint }: MapViewProps) => {
  const { points } = useData();
  return (
  <div className="h-full w-full relative leaflet-grayscale">
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      {points.map(p => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={customIcon}
          eventHandlers={{ click: () => onSelectPoint(p) }}
        />
      ))}
    </MapContainer>
  </div>
  );
};
