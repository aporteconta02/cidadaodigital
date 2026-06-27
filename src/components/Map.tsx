import { lazy, Suspense } from 'react';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description: string;
    type: string;
    created_at?: string;
    confirmacoes?: number;
    resolved?: boolean;
  }>;
  onConfirmAlert?: (alertId: string) => void;
  onViewDetails?: (alertId: string) => void;
  isAdminView?: boolean;
  light?: boolean;
}

const MapInner = lazy(() => import('./MapInner'));

function Fallback() {
  return (
    <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center rounded-3xl">
      <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Carregando Mapa...</span>
    </div>
  );
}

export default function Map(props: MapProps) {
  if (typeof window === 'undefined') return <Fallback />;
  return (
    <Suspense fallback={<Fallback />}>
      <MapInner {...props} />
    </Suspense>
  );
}
