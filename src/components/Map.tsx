import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
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
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    description: string;
    type: string;
  }>;
}

export default function Map({ center, zoom, markers = [] }: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center rounded-3xl">
        <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Carregando Mapa...</span>
      </div>
    );
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={false}
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>Você está aqui</Popup>
      </Marker>
      
      {markers.map((marker, i) => (
        <Marker key={i} position={marker.position}>
          <Popup>
            <div className="p-2">
              <h4 className="font-black text-xs uppercase text-sos">{marker.title}</h4>
              <p className="text-[10px] mt-1">{marker.description}</p>
              <button className="mt-2 w-full bg-sos/10 text-sos text-[8px] font-black uppercase py-1 rounded">Confirmar</button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
