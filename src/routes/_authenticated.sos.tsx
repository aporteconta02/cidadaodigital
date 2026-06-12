import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Map as MapIcon, 
  Plus, 
  Phone, 
  MessageSquare, 
  X,
  AlertTriangle,
  Eye,
  Bell,
  Navigation,
  Crown,
  History,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map from "@/components/Map";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";



export const Route = createFileRoute("/_authenticated/sos")({
  component: SOSPage,
});

const ALERT_TYPES = [
  { id: 'suspeito', label: "Suspeito", color: "#FF2D2D", icon: <Eye size={20} /> },
  { id: 'perturbacao', label: "Perturbação", color: "#FF8A00", icon: <AlertTriangle size={20} /> },
  { id: 'acidente', label: "Acidente", color: "#FFD600", icon: <Navigation size={20} /> },
  { id: 'crime', label: "Crime", color: "#000000", icon: <ShieldAlert size={20} /> },
];

function SOSPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    fetchUserData();
    setupGeolocation();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('usuarios').select('*').eq('auth_id', session.user.id).maybeSingle();
      if (data) {
        setUser(data);
        setIsSubscriber(!!data.assinante_plus);
      }
    } else {
      // Demo mode
      setIsSubscriber(true);
    }
    setLoading(false);
  };

  const setupGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSOS = () => {
    if (!user || !location) {
      toast.error("Localização não disponível");
      return;
    }
    setSosActive(true);
    setShowSOSConfirm(false);
    
    // Simulate WhatsApp SOS to a contact
    const mensagem = encodeURIComponent(
      `🚨 EMERGÊNCIA: ${user.nome} acionou alerta SOS.\n📍 Localização: https://maps.google.com/?q=${location.lat},${location.lng}\n⏰ ${new Date().toLocaleString('pt-BR')}`
    );
    // In production we would fetch a real trusted contact
    window.open(`https://wa.me/5511999999999?text=${mensagem}`);
    toast.success("Alerta SOS disparado para contatos de confiança!");
  };

  if (loading) return <div className="p-8 text-center font-bold">Carregando...</div>;

  if (!isSubscriber) {
    return <SubscriberGate onSubscribe={() => setIsSubscriber(true)} />;
  }

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      {/* SOS Header */}
      <section className="px-6 pt-6 mb-8">
        <motion.button 
          onClick={() => setShowSOSConfirm(true)}
          className={cn(
            "w-full py-6 rounded-3xl flex flex-col items-center justify-center gap-2 shadow-standard relative overflow-hidden transition-all active:scale-95",
            sosActive ? "bg-sos" : "bg-sos/90 hover:bg-sos sos-pulse"
          )}
        >
          <div className="flex items-center gap-3">
             <ShieldAlert size={32} strokeWidth={2.5} className="text-white" />
             <span className="text-2xl font-black font-display text-white uppercase tracking-tighter">SOS EMERGÊNCIA</span>
          </div>
          <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Pressione em caso de risco real</span>
        </motion.button>
      </section>

      {/* SOS Active Card */}
      <AnimatePresence>
        {sosActive && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 mb-8"
          >
            <div className="bg-card border-2 border-sos rounded-3xl p-6 shadow-standard">
              <div className="flex items-center gap-3 mb-6">
                 <div className="size-3 bg-sos rounded-full animate-ping" />
                 <h3 className="text-sos font-black uppercase tracking-widest text-sm">Alerta SOS Ativado</h3>
              </div>
              
              <div className="bg-background/50 rounded-2xl p-4 border border-white/5 mb-6">
                <div className="flex items-start gap-3">
                  <Navigation size={18} className="text-primary shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Localização Atual</p>
                    <p className="text-sm font-black">Rua das Flores, 123 (Aprox.)</p>
                    <p className="text-[10px] text-muted-foreground mt-1">-23.5612, -46.6623</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <a 
                  href="tel:190"
                  className="w-full bg-sos text-white font-black py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 transition-all"
                >
                  <Phone size={24} />
                  Ligar 190 Agora
                </a>
                <button 
                  onClick={() => window.open('https://wa.me/?text=ESTOU EM EMERGÊNCIA! Minha localização: https://maps.google.com/?q=-23.5612,-46.6623', '_blank')}
                  className="w-full bg-secondary text-secondary-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 transition-all"
                >
                  <MessageSquare size={20} />
                  Avisar Contatos
                </button>
                <button 
                  onClick={() => setSosActive(false)}
                  className="w-full bg-transparent text-muted-foreground font-black py-2 rounded-xl text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancelar Alerta
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Map Section */}
      <section className="px-6 mb-8 h-80 relative group">
        <div className="w-full h-full rounded-3xl overflow-hidden border border-white/5 shadow-standard relative z-0">
          <Map 
            center={[-23.5612, -46.6623]} 
            zoom={15}
            markers={[
              { 
                position: [-23.5650, -46.6650], 
                title: 'Suspeito', 
                description: 'Indivíduo observando casas.',
                type: 'suspeito'
              }
            ]}
          />
        </div>
        
        {/* Floating Action Button */}
        <button 
          onClick={() => setShowAddAlert(true)}
          className="absolute bottom-4 right-10 size-16 rounded-2xl bg-primary text-primary-foreground shadow-2xl flex items-center justify-center active:scale-90 transition-all z-10"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </section>

      {/* Recent Alerts */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Alertas Recentes (24h)</h2>
        </div>
        <div className="space-y-3">
          {[
            { type: 'suspeito', title: 'Comportamento Suspeito', loc: 'Rua Bela Cintra', time: 'Há 12 min', conf: 3 },
            { type: 'perturbacao', title: 'Barulho Excessivo', loc: 'Av. Paulista', time: 'Há 45 min', conf: 1 },
            { type: 'acidente', title: 'Acidente de Trânsito', loc: 'Rua Oscar Freire', time: 'Há 1h', conf: 8 },
          ].map((alert, i) => (
            <div key={i} className="bg-card border border-white/5 rounded-2xl p-4 shadow-standard flex items-center justify-between group cursor-pointer hover:bg-card-hover transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "size-10 rounded-xl flex items-center justify-center",
                  alert.type === 'suspeito' ? "bg-sos/10 text-sos" : 
                  alert.type === 'perturbacao' ? "bg-premium/10 text-premium" : "bg-primary/10 text-primary"
                )}>
                  {alert.type === 'suspeito' ? <Eye size={18} /> : 
                   alert.type === 'perturbacao' ? <AlertTriangle size={18} /> : <Navigation size={18} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{alert.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{alert.loc} • {alert.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                 <ShieldCheck size={12} className="text-secondary" />
                 <span className="text-[10px] font-black text-secondary">{alert.conf}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subpages / Actions */}
      <section className="px-6 mt-8 grid grid-cols-2 gap-3">
        <SubPageButton icon={<Users size={18} />} label="Meus Contatos" />
        <SubPageButton icon={<History size={18} />} label="Histórico" />
      </section>

      {/* SOS Confirm Modal */}
      <Modal show={showSOSConfirm} onClose={() => setShowSOSConfirm(false)}>
        <div className="text-center p-4">
           <div className="size-20 rounded-full bg-sos/20 flex items-center justify-center text-sos mx-auto mb-6 sos-pulse">
              <ShieldAlert size={40} />
           </div>
           <h3 className="text-xl font-black font-display uppercase tracking-tight mb-2">Confirmar SOS?</h3>
           <p className="text-muted-foreground text-sm mb-8">Vizinhos e autoridades próximas serão notificados com sua localização.</p>
           <div className="flex flex-col gap-3">
              <button 
                onClick={handleSOS}
                className="w-full bg-sos text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Sim, Confirmar
              </button>
              <button 
                onClick={() => setShowSOSConfirm(false)}
                className="w-full py-4 text-xs font-black uppercase text-muted-foreground hover:text-white transition-colors"
              >
                Cancelar
              </button>
           </div>
        </div>
      </Modal>

      {/* Create Alerta Modal */}
      <Modal show={showAddAlert} onClose={() => setShowAddAlert(false)}>
        <div className="p-2">
          <h3 className="text-xl font-black font-display uppercase tracking-tight mb-6">Novo Alerta</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ALERT_TYPES.map((type) => (
              <button 
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                  selectedType === type.id ? "bg-white/10 border-white/20" : "bg-card border-white/5 opacity-50"
                )}
                style={{ color: selectedType === type.id ? type.color : '' }}
              >
                {type.icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
              </button>
            ))}
          </div>
          <textarea 
            placeholder="Descreva a situação..."
            className="w-full bg-background border border-white/5 rounded-2xl p-4 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] mb-4"
          />
          <div className="p-4 bg-muted/30 rounded-2xl border border-white/5 mb-6">
             <p className="text-[10px] text-muted-foreground leading-snug">
               <span className="text-premium font-black">IMPORTANTE:</span> Descreva apenas comportamentos e situações. Não descreva características físicas de pessoas.
             </p>
          </div>
          <button 
            onClick={() => setShowAddAlert(false)}
            className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl uppercase tracking-widest shadow-standard active:scale-95 transition-all"
          >
            Publicar Alerta
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SubscriberGate({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="size-24 rounded-3xl bg-premium/10 border border-premium/30 flex items-center justify-center text-premium mb-8 shadow-[0_0_40px_rgba(255,184,0,0.1)]">
        <Crown size={48} strokeWidth={2.5} />
      </div>
      <h2 className="text-3xl font-black font-display tracking-tighter uppercase mb-4">Vizinho Seguro</h2>
      <p className="text-muted-foreground text-sm mb-10 max-w-[280px]">Tenha acesso exclusivo ao mapa de segurança, alertas em tempo real e botão SOS premium.</p>
      
      <div className="w-full space-y-4 mb-12">
        <GateItem label="Mapa de Alertas em Tempo Real" />
        <GateItem label="Notificações Críticas de Segurança" />
        <GateItem label="Botão SOS com Localização GPS" />
        <GateItem label="Rede de Vizinhos Confiáveis" />
      </div>

      <button 
        onClick={onSubscribe}
        className="w-full bg-premium text-primary-foreground font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(255,184,0,0.3)] text-lg uppercase tracking-wider active:scale-95 transition-all mb-4"
      >
        Assinar por R$ 9,90/mês
      </button>
      <button className="text-xs font-black uppercase text-muted-foreground tracking-widest hover:text-white transition-colors">
        Ver todos os planos
      </button>
    </div>
  );
}

function GateItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-card border border-white/5 rounded-2xl text-left">
      <ShieldCheck size={18} className="text-secondary shrink-0" />
      <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}

function SubPageButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-white/5 hover:bg-card-hover transition-colors shadow-standard">
      <div className="text-primary">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function Modal({ show, onClose, children }: { show: boolean, onClose: () => void, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="w-full max-w-lg bg-card border border-white/10 rounded-[32px] p-6 relative z-10 shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 size-10 rounded-full bg-background border border-white/5 flex items-center justify-center text-muted-foreground"
            >
              <X size={20} />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
