import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Eye, AlertTriangle, Navigation, Plus, ShieldCheck, Crown, X, Phone, MessageSquare } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map from "@/components/Map";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sos")({
  component: SOSPage,
});

function SOSPage() {
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [sosPressed, setSosPressed] = useState(false);
  const pressTimeout = useRef<NodeJS.Timeout | null>(null);

  if (!isSubscriber) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
        <div className="size-24 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-primary/20 to-secondary/20">
          <ShieldAlert size={48} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sua segurança em primeiro lugar</h2>
        <div className="w-full space-y-4 mb-10 text-left">
          {["Mapa de Alertas em Tempo Real", "Botão SOS com localização GPS", "Notificações de segurança", "Rede de Vizinhos Confiáveis"].map((item) => (
            <div key={item} className="flex items-center gap-3 p-4 bg-bg-card rounded-xl border border-border">
              <ShieldCheck className="text-secondary size-5" />
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setIsSubscriber(true)}
          className="w-full py-4 rounded-2xl bg-gradient-hero text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          Ativar por R$ 9,90/mês
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-72px)] overflow-hidden">
      {/* Map Area */}
      <div className="h-[55%] w-full relative">
        <Map center={[-23.5612, -46.6623]} zoom={15} />
        {/* FAB Plus */}
        <button className="absolute bottom-4 left-4 size-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
          <Plus size={28} />
        </button>
      </div>

      {/* SOS Button (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20">
        <motion.button
          onMouseDown={() => {
            pressTimeout.current = setTimeout(() => {
              setSosPressed(true);
              toast.error("SOS ACIONADO!");
            }, 2000);
          }}
          onMouseUp={() => pressTimeout.current && clearTimeout(pressTimeout.current)}
          onTouchStart={() => {
            pressTimeout.current = setTimeout(() => {
              setSosPressed(true);
              toast.error("SOS ACIONADO!");
            }, 2000);
          }}
          onTouchEnd={() => pressTimeout.current && clearTimeout(pressTimeout.current)}
          className={cn(
            "size-20 rounded-full flex items-center justify-center bg-[#FF3B5C] shadow-[0_8px_24px_rgba(255,59,92,0.5)] active:scale-90 transition-transform sos-pulse",
            sosPressed && "bg-white"
          )}
        >
          <span className="text-white text-3xl font-black italic">SOS</span>
        </motion.button>
      </div>

      {/* Alert List */}
      <div className="h-[45%] w-full bg-bg-primary overflow-y-auto px-4 pt-4 pb-20">
        <h3 className="text-text-secondary font-bold text-xs uppercase tracking-widest mb-4">Alertas recentes</h3>
        <div className="space-y-3">
          {[
            { type: 'suspeito', title: 'Suspeito na via', rua: 'Rua Bela Cintra', time: '12 min', count: 3 },
            { type: 'perturbacao', title: 'Barulho Excessivo', rua: 'Av. Paulista', time: '45 min', count: 1 },
            { type: 'acidente', title: 'Acidente de trânsito', rua: 'Rua Oscar Freire', time: '1h', count: 8 },
          ].map((alert, i) => (
            <div key={i} className="bg-bg-card rounded-xl p-4 flex items-center gap-4 border-l-4 border-l-primary">
              <div className="size-10 rounded-full bg-white/5 flex items-center justify-center">
                {alert.type === 'suspeito' ? <Eye size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{alert.title}</h4>
                <p className="text-xs text-text-secondary">{alert.rua} • Há {alert.time}</p>
              </div>
              <div className="text-xs font-bold text-secondary">+{alert.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
