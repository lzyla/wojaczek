import L from 'leaflet';
import { MAP_CENTER, MAP_ZOOM, MAP_DETAIL_ZOOM } from '../../constants';

export const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export const customIcon = L.divIcon({
  className: '',
  html: `<div class="w-8 h-8 bg-white border border-[#0a0a0a] flex items-center justify-center shadow-sm" style="border-radius: 0;">
            <div class="w-2 h-2 bg-[#c23030]" style="border-radius: 0;"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export const miniIcon = L.divIcon({
  className: '',
  html: `<div class="w-3 h-3 bg-[#c23030] border border-white/50" style="border-radius: 50%;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export { MAP_CENTER, MAP_ZOOM, MAP_DETAIL_ZOOM };
