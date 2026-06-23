import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const getIcon = (type: string) => {
  let color = '#6C63FF';
  if (type === 'suspeito') color = '#FF3B5C';
  if (type === 'perturbacao') color = '#FF8C00';
  if (type === 'acidente') color = '#FFB800';
  if (type === 'crime') color = '#6C63FF';
  if (type === 'sos') color = '#FF3B5C';
  if (type === 'user') color = '#00D68F';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

interface MapProps {
  center?: [number, number];
  zoom?: [number, number] | number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description: string;
    type: string;
    created_at?: string;
    confirmacoes?: number;
  }>;
  onConfirmAlert?: (alertId: string) => void;
  isAdminView?: boolean;
  light?: boolean;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapInner({ 
  center = [-23.5505, -46.6333], 
  zoom = 13, 
  markers = [], 
  onConfirmAlert,
  isAdminView,
  light = false,
}: MapProps) {
  const actualZoom = typeof zoom === 'number' ? zoom : 13;
  
  return (
    <MapContainer center={center} zoom={actualZoom} scrollWheelZoom={false} className="w-full h-full">
      <ChangeView center={center} zoom={actualZoom} />
      <TileLayer
        attribution={light ? '&copy; OpenStreetMap contributors' : '&copy; CARTO'}
        url={light
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
      />
      {markers.map((marker, i) => (
        <Marker key={marker.id || i} position={marker.position} icon={getIcon(marker.type)}>
          <Popup>
            <div className="p-2 min-w-[150px]">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-black text-[10px] uppercase text-text-primary tracking-wider">{marker.title}</h4>
                {marker.created_at && (
                  <span className="text-[8px] text-text-muted font-bold">
                    {formatDistanceToNow(new Date(marker.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-text-secondary leading-tight mb-2">{marker.description || 'Sem descrição.'}</p>
              {!isAdminView && marker.type !== 'user' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <ShieldCheck size={10} className="text-success" />
                    <span className="text-[9px] font-bold">{marker.confirmacoes || 0} confirmações</span>
                  </div>
                  <button
                    onClick={() => onConfirmAlert?.(marker.id)}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase py-1.5 rounded transition-colors"
                  >
                    Confirmar Alerta
                  </button>
                </div>
              )}
              {isAdminView && (
                 <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="text-[8px] text-danger font-black uppercase tracking-widest">Painel Admin</p>
                 </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}