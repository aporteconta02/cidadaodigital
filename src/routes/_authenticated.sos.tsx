import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Eye, AlertTriangle, Navigation, Plus, ShieldCheck, Crown, X, Phone, MessageSquare, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map from "@/components/Map";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sos")({
  component: SOSPage,
});

const ALERT_TYPES = {
  suspeito: { color: "border-l-[#FF3B5C]", icon: <Eye size={18} className="text-[#FF3B5C]" />, label: "Suspeito" },
  perturbacao: { color: "border-l-[#FFB800]", icon: <AlertTriangle size={18} className="text-[#FFB800]" />, label: "Perturbação" },
  acidente: { color: "border-l-[#00D68F]", icon: <Navigation size={18} className="text-[#00D68F]" />, label: "Acidente" },
};

function SOSPage() {
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [sosProgress, setSosProgress] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const pressInterval = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    setSosProgress(0);
    pressInterval.current = setInterval(() => {
      setSosProgress(prev => {
        if (prev >= 100) {
          clearInterval(pressInterval.current!);
          triggerSOS();
          return 100;
        }
        return prev + 2; // ~1 second to fill if 50ms interval? No, 2s = 2000ms. 2000/50 = 40 steps. 100/40 = 2.5.
      });
    }, 50);
  };

  const stopPress = () => {
    if (pressInterval.current) clearInterval(pressInterval.current);
    if (sosProgress < 100) setSosProgress(0);
  };

  const triggerSOS = () => {
    setSosActive(true);
    toast.error("🚨 SOS ACIONADO! Autoridades e vizinhos notificados.", {
      duration: 5000,
    });
  };

  if (!isSubscriber) {
    return (
      <div className="min-h-[calc(100vh-144px)] bg-bg-primary flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="size-24 rounded-3xl bg-gradient-hero flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(108,99,255,0.2)]">
          <ShieldAlert size={48} className="text-white" />
        </div>
        <h2 className="text-2xl font-black font-space uppercase tracking-tight mb-2">Sua segurança em primeiro lugar</h2>
        <p className="text-text-secondary text-sm mb-10 max-w-[280px]">Ative o Vizinho Seguro para proteger você e sua família.</p>
        
        <div className="w-full space-y-3 mb-12">
          {[
            { label: "Mapa de Alertas em Tempo Real", icon: <MapPin className="text-primary" /> },
            { label: "Botão SOS com Localização GPS", icon: <ShieldAlert className="text-danger" /> },
            { label: "Notificações de Ocorrências", icon: <AlertTriangle className="text-warning" /> },
            { label: "Rede de Vizinhos Ativa", icon: <ShieldCheck className="text-success" /> }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-bg-card rounded-2xl border border-border-custom text-left">
              <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsSubscriber(true)}
          className="w-full bg-gradient-hero text-white font-black py-5 rounded-2xl shadow-lg text-lg uppercase tracking-wider active:scale-95 transition-all"
        >
          Ativar por R$ 9,90/mês
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-144px)] overflow-hidden">
      {/* Map Section (55%) */}
      <div className="h-[55%] w-full relative">
        <Map 
          center={[-23.5612, -46.6623]} 
          zoom={15}
          markers={[
            { position: [-23.5612, -46.6623], title: "Você", description: "Sua localização", type: "user" },
            { position: [-23.5632, -46.6643], title: "Suspeito", description: "Indivíduo em atitude suspeita", type: "suspeito" },
            { position: [-23.5600, -46.6600], title: "Acidente", description: "Colisão leve entre veículos", type: "acidente" }
          ]}
        />
        
        {/* Floating FAB Plus */}
        <button className="absolute bottom-6 left-6 size-14 rounded-2xl bg-primary text-white shadow-lg active:scale-90 transition-all flex items-center justify-center z-10">
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* SOS Button (Fixed bottom right of the page context) */}
      <div className="absolute bottom-6 right-6 z-20">
        <div className="relative">
          {/* Progress ring or pulse effect */}
          <div className="absolute -inset-4 rounded-full border-4 border-danger/20" />
          {sosProgress > 0 && (
            <svg className="absolute -inset-4 size-28 -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="326.7"
                strokeDashoffset={326.7 - (326.7 * sosProgress) / 100}
                className="text-danger transition-all duration-75"
              />
            </svg>
          )}
          
          <button
            onMouseDown={startPress}
            onMouseUp={stopPress}
            onMouseLeave={stopPress}
            onTouchStart={startPress}
            onTouchEnd={stopPress}
            className={cn(
              "size-20 rounded-full flex flex-col items-center justify-center bg-danger shadow-[0_8px_32px_rgba(255,59,92,0.4)] transition-all select-none active:scale-95",
              !sosActive && "sos-pulse"
            )}
          >
            <span className="text-white text-2xl font-black italic leading-none">SOS</span>
            <span className="text-[8px] text-white/70 font-bold uppercase tracking-widest mt-1">Segure</span>
          </button>
        </div>
      </div>

      {/* Alert List (45%) */}
      <div className="h-[45%] w-full bg-bg-primary overflow-y-auto px-6 pt-6 pb-20 no-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Alertas em tempo real</h3>
          <span className="size-2 rounded-full bg-danger animate-pulse" />
        </div>
        
        <div className="space-y-3">
          {[
            { type: 'suspeito', title: 'Comportamento Suspeito', loc: 'Rua Bela Cintra', time: '12 min', conf: 3 },
            { type: 'perturbacao', title: 'Barulho Excessivo', loc: 'Av. Paulista', time: '45 min', conf: 1 },
            { type: 'acidente', title: 'Acidente de Trânsito', loc: 'Rua Oscar Freire', time: '1h', conf: 8 },
          ].map((alert, i) => (
            <div 
              key={i} 
              className={cn(
                "bg-bg-card rounded-2xl p-4 flex items-center justify-between border border-white/5 shadow-sm transition-all active:scale-[0.98]",
                ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES].color,
                "border-l-4"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  {ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES].icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">{alert.title}</h4>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">{alert.loc} • Há {alert.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                <ShieldCheck size={12} className="text-success" />
                <span className="text-[10px] font-black text-text-primary">{alert.conf}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Active Overlay */}
      <AnimatePresence>
        {sosActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-danger flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="size-32 rounded-full bg-white/20 flex items-center justify-center mb-8"
            >
              <ShieldAlert size={64} className="text-white" />
            </motion.div>
            <h2 className="text-4xl font-black font-space text-white uppercase tracking-tighter mb-4 italic">ALERTA DISPARADO</h2>
            <p className="text-white/80 font-bold mb-12">Sua localização foi enviada para as autoridades e vizinhos próximos.</p>
            
            <div className="w-full space-y-4">
              <button className="w-full bg-white text-danger font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest">
                <Phone size={24} />
                Ligar 190
              </button>
              <button 
                onClick={() => setSosActive(false)}
                className="w-full bg-transparent text-white/60 font-black py-4 uppercase tracking-widest text-xs"
              >
                Ops! Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
