import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert, Eye, AlertTriangle, Navigation, Plus, ShieldCheck, Crown, X, Phone, MessageSquare, MapPin, Search, User } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map from "@/components/Map";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/sos")({
  component: SOSPage,
});

function ContatosSection() {
  const { usuario } = useAuth();
  const [contatos, setContatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchContatos = useCallback(async () => {
    if (!usuario?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('contatos_confianca')
      .select('*')
      .eq('usuario_id', usuario.id);
    
    if (!error) setContatos(data || []);
    setLoading(false);
  }, [usuario?.id]);

  useEffect(() => {
    fetchContatos();
  }, [fetchContatos]);

  const addContato = async () => {
    if (!usuario?.id || !nome || !telefone) {
      toast.error("Preencha todos os campos.");
      return;
    }
    
    if (contatos.length >= 5) {
      toast.error("Máximo de 5 contatos permitido.");
      return;
    }

    const { error } = await supabase.from('contatos_confianca').insert({
      usuario_id: usuario.id,
      nome,
      telefone
    });

    if (error) {
      toast.error("Erro ao adicionar contato.");
    } else {
      toast.success("Contato adicionado!");
      setNome('');
      setTelefone('');
      setIsOpen(false);
      fetchContatos();
    }
  };

  const removeContato = async (id: string) => {
    const { error } = await supabase.from('contatos_confianca').delete().eq('id', id);
    if (!error) {
      toast.success("Contato removido.");
      fetchContatos();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Contatos de Confiança</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-all">
              <Plus size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Adicionar</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-bg-elevated border-border-custom rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black font-space uppercase italic">Novo Contato</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nome do Contato</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Esposa, Pai, Vizinho..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Telefone (WhatsApp)</label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: 31999999999"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 text-white"
                />
              </div>
              <button
                onClick={addContato}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-glow active:scale-95 transition-all"
              >
                Salvar Contato
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
        ) : contatos.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
            <p className="text-[10px] font-bold uppercase text-text-muted tracking-widest">Nenhum contato cadastrado</p>
          </div>
        ) : (
          contatos.map((contato) => (
            <div key={contato.id} className="bg-bg-card rounded-2xl p-4 flex items-center justify-between border border-white/5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <User size={18} className="text-text-muted" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">{contato.nome}</h4>
                  <p className="text-[10px] text-text-muted font-bold tracking-tight">{contato.telefone}</p>
                </div>
              </div>
              <button 
                onClick={() => removeContato(contato.id)}
                className="size-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger active:scale-90 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const ALERT_TYPES = {
  suspeito: { color: "border-l-[#FF3B5C]", icon: <Eye size={18} className="text-[#FF3B5C]" />, label: "Suspeito", hex: "#FF3B5C" },
  perturbacao: { color: "border-l-[#FF8C00]", icon: <AlertTriangle size={18} className="text-[#FF8C00]" />, label: "Perturbação", hex: "#FF8C00" },
  acidente: { color: "border-l-[#FFB800]", icon: <Navigation size={18} className="text-[#FFB800]" />, label: "Acidente", hex: "#FFB800" },
  crime: { color: "border-l-[#6C63FF]", icon: <ShieldAlert size={18} className="text-[#6C63FF]" />, label: "Crime", hex: "#6C63FF" },
  sos: { color: "border-l-[#FF3B5C]", icon: <ShieldAlert size={18} className="text-[#FF3B5C]" />, label: "SOS", hex: "#FF3B5C" },
};

export default function SOSPage() {
  const search = Route.useSearch() as any;
  const { usuario, isAssinante } = useAuth();
  const [sosProgress, setSosProgress] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.5612, -46.6623]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(!!search?.new);
  const [newAlertType, setNewAlertType] = useState<string>('suspeito');
  const [newAlertDesc, setNewAlertDesc] = useState('');
  const [activeTab, setActiveTab] = useState<'alertas' | 'contatos'>('alertas');
  const [resolveTarget, setResolveTarget] = useState<any>(null);
  const [resolveText, setResolveText] = useState('');
  const pressInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch alerts and user location
  useEffect(() => {
    const isValido = usuario?.validade_assinatura ? new Date(usuario.validade_assinatura) > new Date() : false;
    if (isAssinante && isValido) {
      fetchAlerts();
      
      // Realtime subscription
      const channel = supabase
        .channel('alertas-bairro')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'alertas_seguranca', filter: `bairro=eq.${usuario?.bairro}` },
          (payload) => {
            console.log('New alert received:', payload);
            setAlerts(prev => [payload.new, ...prev]);
            toast.warning("⚠️ Novo alerta no seu bairro!");
          }
        )
        .subscribe();

      // Geolocation
      // Realtime geolocation (live tracking)
      let watchId: number | null = null;
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
          (error) => console.error("Geolocation error:", error),
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      }

      return () => {
        supabase.removeChannel(channel);
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [isAssinante, usuario?.bairro]);

  const fetchAlerts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alertas_seguranca')
      .select('*')
      .eq('bairro', usuario?.bairro || '')
      .eq('ativo', true)
      .gt('expira_em', new Date().toISOString())
      .order('criado_em', { ascending: false });

    if (error) {
      console.error("Error fetching alerts:", error);
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const startPress = () => {
    setSosProgress(0);
    pressInterval.current = setInterval(() => {
      setSosProgress(prev => {
        if (prev >= 100) {
          clearInterval(pressInterval.current!);
          triggerSOS();
          return 100;
        }
        return prev + 2.5; 
      });
    }, 50); // exactly 2 seconds
  };

  const stopPress = () => {
    if (pressInterval.current) clearInterval(pressInterval.current);
    if (sosProgress < 100) setSosProgress(0);
  };

  const triggerSOS = async () => {
    if (!usuario?.id) return;
    setSosActive(true);
    
    const { error } = await supabase.from('alertas_seguranca').insert({
      usuario_id: usuario.id,
      tipo: 'sos',
      descricao: `SOS acionado por ${usuario.nome}`,
      latitude: userLocation[0],
      longitude: userLocation[1],
      bairro: usuario.bairro,
      expira_em: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), 
    });

    if (error) {
      toast.error("Erro ao disparar SOS.");
    } else {
      toast.error("🚨 SOS ACIONADO! Autoridades e vizinhos notificados.");
    }
  };

  const createAlert = async () => {
    if (!usuario?.id) return;
    
    const { error } = await supabase.from('alertas_seguranca').insert({
      usuario_id: usuario.id,
      tipo: newAlertType,
      descricao: newAlertDesc,
      latitude: userLocation[0],
      longitude: userLocation[1],
      bairro: usuario.bairro,
      expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) {
      toast.error("Erro ao criar alerta.");
    } else {
      toast.success("Alerta criado com sucesso!");
      setIsAlertModalOpen(false);
      setNewAlertDesc('');
      fetchAlerts();
    }
  };

  const confirmAlert = async (alertId: string) => {
    const confirmedAlerts = JSON.parse(localStorage.getItem('confirmed_alerts') || '[]');
    if (confirmedAlerts.includes(alertId)) {
      toast.info("Você já confirmou este alerta.");
      return;
    }

    const { error } = await supabase.rpc('increment_confirmacoes' as any, { alert_id: alertId });
    
    if (error) {
       console.error("RPC error:", error);
       // Fallback logic could go here
    }

    localStorage.setItem('confirmed_alerts', JSON.stringify([...confirmedAlerts, alertId]));
    toast.success("Obrigado pela confirmação!");
    fetchAlerts();
  };

  const shareSOSWhatsApp = () => {
    const message = `🚨 EMERGÊNCIA SOS!\n${usuario?.nome} precisou de ajuda.\n📍 https://maps.google.com/?q=${userLocation[0]},${userLocation[1]}\n⏰ ${new Date().toLocaleTimeString('pt-BR')}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const isValido = usuario?.validade_assinatura ? new Date(usuario.validade_assinatura) > new Date() : false;
  if (!isAssinante || !isValido) {
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
          className="w-full bg-gradient-hero text-white font-black py-5 rounded-2xl shadow-lg text-lg uppercase tracking-wider active:scale-95 transition-all"
        >
          Ativar por R$ 9,90/mês
        </button>
      </div>
    );
  }

  const mapMarkers = [
    { id: 'user', position: userLocation, title: "Você", description: "Sua localização atual", type: "user" },
    ...alerts.map(a => ({
      id: a.id,
      position: [Number(a.latitude), Number(a.longitude)] as [number, number],
      title: ALERT_TYPES[a.tipo as keyof typeof ALERT_TYPES]?.label || 'Alerta',
      description: a.descricao,
      type: a.tipo,
      created_at: a.criado_em,
      confirmacoes: a.confirmacoes
    }))
  ];

  return (
    <div className="relative h-[calc(100vh-144px)] overflow-hidden flex flex-col">
      {/* Map Section (50%) */}
      <div className="h-1/2 w-full relative">
        <Map 
          center={userLocation} 
          zoom={15}
          markers={mapMarkers}
          onConfirmAlert={confirmAlert}
        />
        
        {/* Floating FAB Plus */}
        <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
          <DialogTrigger asChild>
            <button className="absolute bottom-6 left-6 size-14 rounded-2xl bg-primary text-white shadow-lg active:scale-90 transition-all flex items-center justify-center z-10">
              <Plus size={28} strokeWidth={3} />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-bg-elevated border-border-custom rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black font-space uppercase italic text-white">Novo Alerta</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ALERT_TYPES).filter(([k]) => k !== 'sos').map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setNewAlertType(key)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                      newAlertType === key ? "border-primary bg-primary/10" : "border-white/5 bg-white/5"
                    )}
                  >
                    {value.icon}
                    <span className="text-[10px] font-bold uppercase text-white">{value.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Descrição (Opcional)</label>
                <textarea
                  value={newAlertDesc}
                  onChange={(e) => setNewAlertDesc(e.target.value)}
                  placeholder="Ex: Carro estranho parado na porta..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 text-white"
                />
                <p className="text-[10px] text-danger font-bold uppercase italic">* Evite descrições físicas de pessoas.</p>
              </div>

              <div className="flex items-center gap-2 text-primary">
                <MapPin size={14} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Localização capturada via GPS</span>
              </div>

              <button
                onClick={createAlert}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-glow active:scale-95 transition-all"
              >
                Publicar Alerta
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* SOS Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <div className="relative">
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

      {/* Content Section (50%) */}
      <div className="flex-1 w-full bg-bg-primary overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          <button 
            onClick={() => setActiveTab('alertas')}
            className={cn(
              "px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
              activeTab === 'alertas' ? "text-primary" : "text-text-muted"
            )}
          >
            Alertas
            {activeTab === 'alertas' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('contatos')}
            className={cn(
              "px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
              activeTab === 'contatos' ? "text-primary" : "text-text-muted"
            )}
          >
            Contatos
            {activeTab === 'contatos' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 no-scrollbar">
          {activeTab === 'alertas' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Ocorrências no Bairro</h3>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-black text-text-muted uppercase">{alerts.length}</span>
                </div>
                <span className="size-2 rounded-full bg-danger animate-pulse" />
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
                  <ShieldCheck size={48} className="mb-4 text-success" />
                  <p className="text-sm font-bold uppercase tracking-widest">Tudo tranquilo no seu bairro! 🟢</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={cn(
                        "bg-bg-card rounded-2xl p-4 flex items-center justify-between border border-white/5 shadow-sm transition-all active:scale-[0.98]",
                        ALERT_TYPES[alert.tipo as keyof typeof ALERT_TYPES]?.color || "border-l-primary",
                        "border-l-4"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                          {ALERT_TYPES[alert.tipo as keyof typeof ALERT_TYPES]?.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-text-primary">
                            {ALERT_TYPES[alert.tipo as keyof typeof ALERT_TYPES]?.label || 'Alerta'}
                          </h4>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">
                            {formatDistanceToNow(new Date(alert.criado_em), { locale: ptBR, addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                        <ShieldCheck size={12} className="text-success" />
                        <span className="text-[10px] font-black text-text-primary">{alert.confirmacoes || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ContatosSection />
          )}
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
            <h2 className="text-4xl font-black font-space text-white uppercase tracking-tighter mb-4 italic leading-tight">ALERTA SOS<br/>DISPARADO</h2>
            <p className="text-white/80 font-bold mb-12 text-sm">Sua localização foi enviada para as autoridades e vizinhos próximos.</p>
            
            <div className="w-full space-y-4 max-w-xs">
              <a 
                href="tel:190"
                className="w-full bg-white text-danger font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest shadow-lg"
              >
                <Phone size={24} />
                Ligar 190
              </a>
              <button 
                onClick={shareSOSWhatsApp}
                className="w-full bg-[#25D366] text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest shadow-lg"
              >
                <MessageSquare size={24} />
                Avisar Contatos
              </button>
              <button 
                onClick={() => setSosActive(false)}
                className="w-full bg-transparent text-white/60 font-black py-4 uppercase tracking-widest text-xs"
              >
                Cancelar Alerta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
