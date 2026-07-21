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

// Inject pulse keyframes once
if (typeof document !== 'undefined' && !document.getElementById('map-pulse-style')) {
  const style = document.createElement('style');
  style.id = 'map-pulse-style';
  style.innerHTML = `
    @keyframes mapPinPulse {
      0% { box-shadow: 0 0 0 0 rgba(255,59,92,0.7); }
      70% { box-shadow: 0 0 0 18px rgba(255,59,92,0); }
      100% { box-shadow: 0 0 0 0 rgba(255,59,92,0); }
    }
    .map-pin-pulse { animation: mapPinPulse 1.4s infinite; }
  `;
  document.head.appendChild(style);
}

function colorFor(type: string, resolved?: boolean): string {
  if (resolved) return '#00D68F';
  const t = (type || '').toLowerCase();
  if (t === 'user') return '#00D68F';
  const map: Record<string, string> = {
    assalto: '#ef4444', roubo: '#ef4444', furto: '#ef4444',
    briga: '#f97316', vandalismo: '#eab308', suspeito: '#3b82f6',
    acidente: '#6b7280', abandono: '#92400e', iluminacao: '#ca8a04',
    drogas: '#dc2626', outro: '#7c3aed',
    crime: '#FF3B5C', sos: '#FF3B5C',
    perturbacao: '#FF8C00', barulho: '#FF8C00',
  };
  return map[t] || '#6C63FF';
}

const getIcon = (_type: string, resolved?: boolean, pulse?: boolean) => {
  const color = resolved ? '#22c55e' : '#ef4444';
  return L.divIcon({
    className: '',
    html: `<div class="${pulse ? 'map-pin-pulse' : ''}" style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

interface MarkerData {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  type: string;
  created_at?: string;
  confirmacoes?: number;
  resolved?: boolean;
}

interface MapProps {
  center?: [number, number];
  zoom?: [number, number] | number;
  markers?: MarkerData[];
  onConfirmAlert?: (alertId: string) => void;
  onViewDetails?: (alertId: string) => void;
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
  onViewDetails,
  isAdminView,
  light = false,
}: MapProps) {
  const actualZoom = typeof zoom === 'number' ? zoom : 13;
  const now = Date.now();

  return (
    <MapContainer center={center} zoom={actualZoom} scrollWheelZoom={false} className="w-full h-full">
      <ChangeView center={center} zoom={actualZoom} />
      <TileLayer
        attribution={light ? '&copy; OpenStreetMap contributors' : '&copy; CARTO'}
        url={light
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
      />
      {markers.map((marker, i) => {
        const ageMs = marker.created_at ? now - new Date(marker.created_at).getTime() : Infinity;
        const isFresh = ageMs < 2 * 60 * 60 * 1000 && marker.type !== 'user' && !marker.resolved;
        return (
          <Marker key={marker.id || i} position={marker.position} icon={getIcon(marker.type, marker.resolved, isFresh)}>
            <Popup>
              <div className="p-2 min-w-[180px]">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h4 className="font-black text-[11px] uppercase text-text-primary tracking-wider">{marker.title}</h4>
                  {marker.created_at && (
                    <span className="text-[9px] text-text-muted font-bold whitespace-nowrap">
                      {formatDistanceToNow(new Date(marker.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-secondary leading-tight mb-2">{marker.description || 'Sem descrição.'}</p>
                {!isAdminView && marker.type !== 'user' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={11} className="text-success" />
                      <span className="text-[10px] font-bold">{marker.confirmacoes || 0} colaborações</span>
                    </div>
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(marker.id)}
                        className="w-full bg-primary text-white text-[10px] font-black uppercase py-1.5 rounded transition-colors"
                      >
                        Ver detalhes e colaborar
                      </button>
                    )}
                    {onConfirmAlert && !marker.resolved && (
                      <button
                        onClick={() => onConfirmAlert(marker.id)}
                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase py-1.5 rounded transition-colors"
                      >
                        Confirmar Alerta
                      </button>
                    )}
                  </div>
                )}
                {isAdminView && (
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="text-[9px] text-danger font-black uppercase tracking-widest">Painel Admin</p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
