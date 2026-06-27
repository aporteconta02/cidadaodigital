import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldAlert, Eye, AlertTriangle, Navigation, Plus, ShieldCheck, Crown, X, Phone, MessageSquare, MapPin, Search, User } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map from "@/components/Map";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { activatePlusSubscription } from "@/lib/subscription.functions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AlertCollaborationDrawer from "@/components/AlertCollaborationDrawer";
import SecurityStatsTab from "@/components/SecurityStatsTab";
import { BannerCarousel } from "@/components/BannerCarousel";

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
  assalto: { color: "border-l-[#ef4444]", icon: <ShieldAlert size={18} className="text-[#ef4444]" />, label: "🔴 Assalto/Roubo", hex: "#ef4444" },
  briga: { color: "border-l-[#f97316]", icon: <AlertTriangle size={18} className="text-[#f97316]" />, label: "🟠 Briga/Conflito", hex: "#f97316" },
  vandalismo: { color: "border-l-[#eab308]", icon: <AlertTriangle size={18} className="text-[#eab308]" />, label: "🟡 Vandalismo", hex: "#eab308" },
  suspeito: { color: "border-l-[#3b82f6]", icon: <Eye size={18} className="text-[#3b82f6]" />, label: "🔵 Suspeito", hex: "#3b82f6" },
  acidente: { color: "border-l-[#6b7280]", icon: <Navigation size={18} className="text-[#6b7280]" />, label: "⚪ Acidente", hex: "#6b7280" },
  abandono: { color: "border-l-[#92400e]", icon: <AlertTriangle size={18} className="text-[#92400e]" />, label: "🟤 Abandono/Lixo", hex: "#92400e" },
  iluminacao: { color: "border-l-[#ca8a04]", icon: <AlertTriangle size={18} className="text-[#ca8a04]" />, label: "💡 Iluminação", hex: "#ca8a04" },
  drogas: { color: "border-l-[#dc2626]", icon: <ShieldAlert size={18} className="text-[#dc2626]" />, label: "🚨 Drogas", hex: "#dc2626" },
  outro: { color: "border-l-[#7c3aed]", icon: <AlertTriangle size={18} className="text-[#7c3aed]" />, label: "📌 Outro", hex: "#7c3aed" },
  // Legacy
  perturbacao: { color: "border-l-[#FF8C00]", icon: <AlertTriangle size={18} className="text-[#FF8C00]" />, label: "Perturbação", hex: "#FF8C00" },
  crime: { color: "border-l-[#6C63FF]", icon: <ShieldAlert size={18} className="text-[#6C63FF]" />, label: "Crime", hex: "#6C63FF" },
  sos: { color: "border-l-[#FF3B5C]", icon: <ShieldAlert size={18} className="text-[#FF3B5C]" />, label: "SOS", hex: "#FF3B5C" },
};

function SOSPage() {
  const search = Route.useSearch() as any;
  const { usuario, isAssinante, refreshUsuario } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosType, setSosType] = useState<string>('assalto');
  const [sosDesc, setSosDesc] = useState('');
  const [sosSubmitting, setSosSubmitting] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.5612, -46.6623]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(!!search?.new);
  const [newAlertType, setNewAlertType] = useState<string>('suspeito');
  const [newAlertDesc, setNewAlertDesc] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | 'meus' | 'resolvidos' | 'contatos' | 'estatisticas'>('todos');
  const [resolveTarget, setResolveTarget] = useState<any>(null);
  const [resolveText, setResolveText] = useState('');
  const [activating, setActivating] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [timeWindow, setTimeWindow] = useState<'all' | '2h' | '24h' | '48h'>('48h');
  const [collabAlert, setCollabAlert] = useState<any | null>(null);

  const activatePlusFn = useServerFn(activatePlusSubscription);
  const ativarAssinatura = async () => {
    if (!usuario?.id) return;
    setActivating(true);
    try {
      await activatePlusFn();
      toast.success("✅ Vizinho Seguro ativado!");
      await refreshUsuario();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao ativar assinatura.");
    } finally {
      setActivating(false);
    }
  };


  // Fetch alerts and user location
  useEffect(() => {
    const isValido = usuario?.validade_assinatura ? new Date(usuario.validade_assinatura) > new Date() : false;
    if (isAssinante && isValido) {
      fetchAlerts();
      
      // Realtime subscription
      const channel = supabase
        .channel('alertas-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'alertas_seguranca' },
          (payload) => {
            fetchAlerts();
            const novo: any = payload.new || {};
            const tipoLabel = ALERT_TYPES[novo.tipo as keyof typeof ALERT_TYPES]?.label || 'Alerta';
            const local = novo.bairro || 'sua região';
            toast.warning(`🚨 ${tipoLabel} em ${local} — agora`, { duration: 6000 });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'alertas_seguranca' },
          () => fetchAlerts()
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
    const nowIso = new Date().toISOString();
    let query = supabase
      .from('alertas_seguranca')
      .select('*, autor:usuarios!alertas_seguranca_usuario_id_fkey(nome, avatar_url, bairro)')
      .is('arquivado_em', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .or(`visivel_ate.gt.${nowIso},visivel_ate.is.null`)
      .order('criado_em', { ascending: false })
      .limit(200);

    // Não filtra por bairro — exibe todos os alertas ativos das últimas 48h

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching alerts:", error);
      toast.error("Erro ao carregar alertas");
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const handleSOSClick = () => {
    if (!usuario?.id) {
      toast.error("Faça login para acionar o SOS.");
      return;
    }
    setSosType('assalto');
    setSosDesc('');
    setSosModalOpen(true);
    try { (navigator as any).vibrate?.(50); } catch {}
  };

  const submitSOS = async () => {
    if (sosSubmitting) return;
    setSosSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Você precisa estar logado');
        return;
      }

      let lat: number | null = userLocation[0] ?? null;
      let lng: number | null = userLocation[1] ?? null;
      try {
        const pos: GeolocationPosition = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error("no geo"));
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 4000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        setUserLocation([lat, lng]);
      } catch {
        // continua sem GPS
      }

      const { error } = await supabase
        .from('sos_alerts')
        .insert({
          user_id: user.id,
          tipo: sosType,
          descricao: sosDesc?.trim() || null,
          latitude: lat,
          longitude: lng,
          status: 'ativo',
        });

      if (error) {
        console.error('Erro SOS:', error);
        toast.error('Erro ao enviar: ' + error.message);
        return;
      }

      toast.success("🚨 SOS ACIONADO! Autoridades e vizinhos notificados.");
      setSosModalOpen(false);
      setSosActive(true);
      setSosType('assalto');
      setSosDesc('');
      try { (navigator as any).vibrate?.(200); } catch {}
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      toast.error('Erro inesperado: ' + (err?.message || 'tente novamente'));
    } finally {
      setSosSubmitting(false);
    }
  };


  const createAlert = async () => {
    if (!usuario?.id) return toast.error("Faça login para criar um alerta.");
    if (!usuario.bairro) return toast.error("Cadastre seu bairro no perfil antes de criar alertas.");
    if (!newAlertType) return toast.error("Escolha o tipo de ocorrência.");

    // Capturar localização fresca via GPS
    let lat: number | null = userLocation[0] ?? null;
    let lng: number | null = userLocation[1] ?? null;
    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('no geo'));
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      setUserLocation([lat, lng]);
    } catch {
      // mantém última posição conhecida
    }

    if (lat == null || lng == null) {
      toast.error("Não foi possível obter sua localização. Ative o GPS.");
      return;
    }

    const { data, error } = await supabase.from('alertas_seguranca').insert({
      usuario_id: usuario.id,
      tipo: newAlertType,
      descricao: newAlertDesc?.trim() || null,
      latitude: lat,
      longitude: lng,
      bairro: usuario.bairro,
      ativo: true,
      expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      visivel_ate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    }).select().single();

    if (error) {
      console.error("Erro ao criar alerta:", error);
      toast.error(error.message || "Não foi possível publicar o alerta. Tente novamente.");
    } else {
      toast.success("✅ Alerta publicado no mapa!");
      setIsAlertModalOpen(false);
      setNewAlertDesc('');
      // Otimista: adiciona já na lista local, depois recarrega
      if (data) setAlerts((prev) => [data as any, ...prev]);
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
      toast.error("Erro ao confirmar alerta. Tente novamente.");
      return;
    }

    localStorage.setItem('confirmed_alerts', JSON.stringify([...confirmedAlerts, alertId]));
    toast.success("Obrigado pela confirmação!");
    fetchAlerts();
  };

  const shareSOSWhatsApp = async () => {
    if (!usuario?.id) return;
    const { data: contatos } = await supabase
      .from('contatos_confianca')
      .select('telefone, nome')
      .eq('usuario_id', usuario.id);

    const message = `🚨 SOS! ${usuario?.nome} precisou de ajuda.\n📍 https://maps.google.com/?q=${userLocation[0]},${userLocation[1]}\n⏰ ${new Date().toLocaleTimeString('pt-BR')}`;

    if (!contatos || contatos.length === 0) {
      toast.warning("Nenhum contato de confiança cadastrado. Abrindo WhatsApp...");
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      return;
    }

    contatos.forEach((c, i) => {
      const tel = String(c.telefone).replace(/\D/g, '');
      const url = `https://wa.me/${tel}?text=${encodeURIComponent(message)}`;
      setTimeout(() => window.open(url, '_blank'), i * 400);
    });
    toast.success(`Avisando ${contatos.length} contato(s)...`);
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
          onClick={ativarAssinatura}
          disabled={activating}
          className="w-full bg-gradient-hero text-white font-black py-5 rounded-2xl shadow-lg text-lg uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
        >
          {activating ? "Ativando..." : "Ativar por R$ 9,90/mês"}
        </button>
      </div>
    );
  }

  const nowTs = Date.now();
  const windowMs = timeWindow === '2h' ? 2 * 3600_000
    : timeWindow === '24h' ? 24 * 3600_000
    : timeWindow === '48h' ? 48 * 3600_000
    : Infinity;
  const mapAlerts = alerts.filter((a) => {
    if (!a.latitude || !a.longitude) return false;
    const created = new Date(a.criado_em).getTime();
    return nowTs - created <= windowMs;
  });

  const mapMarkers = [
    { id: 'user', position: userLocation, title: "Você", description: "Sua localização atual", type: "user" },
    ...mapAlerts.map(a => ({
      id: a.id,
      position: [Number(a.latitude), Number(a.longitude)] as [number, number],
      title: ALERT_TYPES[a.tipo as keyof typeof ALERT_TYPES]?.label || 'Alerta',
      description: a.descricao,
      type: a.tipo,
      created_at: a.criado_em,
      confirmacoes: a.confirmacoes,
      resolved: !!a.resolvido_em || !!a.resolvido,
    }))
  ];

  const handleViewDetails = (id: string) => {
    const a = alerts.find((x) => x.id === id);
    if (a) setCollabAlert(a);
  };

  return (
    <div className="relative h-[calc(100vh-144px)] overflow-hidden flex flex-col">
      {/* Banners */}
      <div className="px-4 pt-3"><BannerCarousel /></div>
      {/* Map Section (50%) */}
      <div className="h-[45%] w-full relative" style={{ zIndex: 1 }}>
        <Map
          center={mapCenter ?? userLocation}
          zoom={mapCenter ? 17 : 15}
          markers={mapMarkers}
          onConfirmAlert={confirmAlert}
          onViewDetails={handleViewDetails}
          light
        />

        {/* Time-window filter pills */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-white/90 backdrop-blur-md rounded-full p-1 shadow-lg border border-black/5">
          {([
            { id: 'all', label: 'Todos' },
            { id: '2h', label: '2h' },
            { id: '24h', label: '24h' },
            { id: '48h', label: '48h' },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTimeWindow(opt.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                timeWindow === opt.id ? "bg-primary text-white shadow" : "text-text-muted hover:text-text-primary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        
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

      {/* SOS Button - fixed, sempre acima do mapa */}
      <button
        type="button"
        onClick={handleSOSClick}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          pointerEvents: 'auto',
          zIndex: 9999,
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          cursor: 'pointer',
        }}
        className={cn(
          "size-20 rounded-full flex flex-col items-center justify-center bg-danger shadow-[0_8px_32px_rgba(255,59,92,0.4)] transition-all select-none active:scale-95",
          !sosActive && "sos-pulse"
        )}
        aria-label="Acionar SOS"
      >
        <span className="text-white text-2xl font-black italic leading-none pointer-events-none">SOS</span>
        <span className="text-[8px] text-white/70 font-bold uppercase tracking-widest mt-1 pointer-events-none">Toque</span>
      </button>

      {/* SOS Emergency Modal */}
      <Dialog open={sosModalOpen} onOpenChange={setSosModalOpen}>
        <DialogContent className="bg-bg-elevated border-border-custom rounded-3xl p-6 z-[10000]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-space uppercase italic text-white">🚨 Emergência</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Tipo de Emergência</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'assalto', label: 'Assalto' },
                  { id: 'incendio', label: 'Incêndio' },
                  { id: 'medica', label: 'Médica' },
                  { id: 'violencia', label: 'Violência' },
                  { id: 'outro', label: 'Outro' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSosType(opt.id)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-xs font-bold uppercase tracking-tight text-white transition-all",
                      sosType === opt.id ? "border-danger bg-danger/15" : "border-white/10 bg-white/5"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Descrição (opcional)</label>
              <textarea
                value={sosDesc}
                onChange={(e) => setSosDesc(e.target.value)}
                placeholder="O que está acontecendo?"
                className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-danger/50 text-white resize-none"
              />
            </div>

            <button
              type="button"
              onClick={submitSOS}
              disabled={sosSubmitting}
              className="w-full bg-danger text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-glow active:scale-95 transition-all disabled:opacity-60"
            >
              {sosSubmitting ? 'Salvando...' : 'Confirmar SOS'}
            </button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Content Section (50%) */}
      <div className="flex-1 w-full bg-bg-primary overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-white/5 px-4 overflow-x-auto no-scrollbar">
          {([
            { id: 'todos', label: 'Todos' },
            { id: 'meus', label: 'Meus' },
            { id: 'resolvidos', label: 'Resolvidos' },
            { id: 'estatisticas', label: '📊 Stats' },
            { id: 'contatos', label: 'Contatos' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-3 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0",
                activeTab === t.id ? "text-primary" : "text-text-muted"
              )}
            >
              {t.label}
              {activeTab === t.id && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 no-scrollbar">
          {activeTab === 'contatos' ? (
            <ContatosSection />
          ) : activeTab === 'estatisticas' ? (
            <SecurityStatsTab bairro={usuario?.bairro} />
          ) : (() => {
            const now = Date.now();
            const isAtivo = (a: any) =>
              a.ativo !== false && !a.resolvido_em && (!a.expira_em || new Date(a.expira_em).getTime() > now);
            const isResolvido = (a: any) => !!a.resolvido_em;
            const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
            const resolvidosMes = alerts.filter((a) => isResolvido(a) && new Date(a.resolvido_em).getTime() >= startOfMonth.getTime()).length;
            const totalAtivos = alerts.filter(isAtivo).length;

            let filtered: any[] = [];
            if (activeTab === 'todos') filtered = alerts.filter(isAtivo);
            else if (activeTab === 'meus') filtered = alerts.filter((a) => a.usuario_id === usuario?.id);
            else if (activeTab === 'resolvidos') filtered = alerts.filter(isResolvido);

            return (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-4 bg-danger/10 border border-danger/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-danger">Ativos</p>
                    <p className="text-2xl font-black text-text-primary">{totalAtivos}</p>
                  </div>
                  <div className="rounded-2xl p-4 bg-success/10 border border-success/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-success">Resolvidos / mês</p>
                    <p className="text-2xl font-black text-text-primary">{resolvidosMes}</p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center opacity-40">
                    <ShieldCheck size={48} className="mb-4 text-success" />
                    <p className="text-sm font-bold uppercase tracking-widest">
                      {activeTab === 'meus' ? 'Você ainda não criou alertas' : activeTab === 'resolvidos' ? 'Nenhum alerta resolvido' : 'Tudo tranquilo no seu bairro! 🟢'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((alert) => {
                      const resolvido = isResolvido(alert);
                      const tipo = ALERT_TYPES[alert.tipo as keyof typeof ALERT_TYPES];
                      const autorNome = alert.autor?.nome || 'Vizinho';
                      const autorAvatar = alert.autor?.avatar_url;
                      return (
                        <div
                          key={alert.id}
                          id={`alert-${alert.id}`}
                          className={cn(
                            "bg-bg-card rounded-2xl p-4 border border-white/5 shadow-sm transition-all border-l-4",
                            tipo?.color || "border-l-primary",
                            resolvido && "opacity-60"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="size-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center">
                                {tipo?.icon}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-text-primary truncate">{tipo?.label || 'Alerta'}</h4>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">
                                  {formatDistanceToNow(new Date(alert.criado_em), { locale: ptBR, addSuffix: true })}
                                  {alert.bairro ? ` • ${alert.bairro}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className={cn(
                              "shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                              resolvido ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                            )}>
                              {resolvido ? 'Resolvido' : 'Ativo'}
                            </span>
                          </div>

                          {alert.descricao && (
                            <p className="mt-3 text-xs text-text-secondary leading-relaxed">{alert.descricao}</p>
                          )}

                          <div className="mt-3 flex items-center gap-2">
                            <div className="size-6 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-[10px] font-black text-text-primary shrink-0">
                              {autorAvatar ? <img src={autorAvatar} alt={autorNome} className="size-full object-cover" /> : autorNome.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-bold text-text-muted truncate">{autorNome}</span>
                            <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-text-muted">
                              <ShieldCheck size={12} className="text-success" /> {alert.confirmacoes || 0}
                            </span>
                          </div>

                          {alert.observacao_resolucao && (
                            <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-xl">
                              <p className="text-[9px] font-black uppercase tracking-widest text-success mb-1">
                                Resolução {alert.resolvido_em && `• ${new Date(alert.resolvido_em).toLocaleDateString('pt-BR')}`}
                              </p>
                              <p className="text-xs text-text-secondary">{alert.observacao_resolucao}</p>
                            </div>
                          )}

                          <div className="mt-3 flex gap-2 flex-wrap">
                            <button
                              onClick={() => setCollabAlert(alert)}
                              className="flex-1 py-2 bg-primary text-white font-black rounded-xl uppercase tracking-widest text-[10px] active:scale-95"
                            >
                              Colaborar
                            </button>
                            {alert.latitude && alert.longitude && (
                              <button
                                onClick={() => setMapCenter([Number(alert.latitude), Number(alert.longitude)])}
                                className="flex-1 py-2 bg-primary/10 text-primary font-black rounded-xl uppercase tracking-widest text-[10px] active:scale-95"
                              >
                                Ver no mapa
                              </button>
                            )}
                            {usuario?.id === alert.usuario_id && !resolvido && (
                              <button
                                onClick={() => { setResolveTarget(alert); setResolveText(''); }}
                                className="flex-1 py-2 bg-success/10 text-success font-black rounded-xl uppercase tracking-widest text-[10px] active:scale-95"
                              >
                                Resolver
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      <Dialog open={!!resolveTarget} onOpenChange={(o) => !o && setResolveTarget(null)}>
        <DialogContent className="bg-bg-elevated border-border-custom rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-space uppercase italic text-white">Resolver Alerta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-xs text-text-muted">O que foi resolvido? Essa observação fica visível para os vizinhos.</p>
            <textarea
              value={resolveText}
              onChange={(e) => setResolveText(e.target.value)}
              maxLength={500}
              placeholder="Ex: Falso alarme, era um vizinho novo / Polícia atendeu..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-success/50 resize-none"
            />
            <button
              onClick={async () => {
                if (!resolveText.trim() || !resolveTarget) return toast.error("Descreva a resolução");
                const { error } = await supabase.from('alertas_seguranca').update({
                  observacao_resolucao: resolveText.trim(),
                  resolvido_em: new Date().toISOString(),
                } as any).eq('id', resolveTarget.id);
                if (error) return toast.error("Erro ao resolver alerta");
                toast.success("Alerta resolvido!");
                setResolveTarget(null);
                fetchAlerts();
              }}
              className="w-full py-4 bg-success text-white font-black rounded-2xl uppercase tracking-widest shadow-glow active:scale-95 transition-all"
            >
              Confirmar Resolução
            </button>
          </div>
        </DialogContent>
      </Dialog>

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

      <AlertCollaborationDrawer
        alert={collabAlert}
        onClose={() => setCollabAlert(null)}
        onResolved={() => { setCollabAlert(null); fetchAlerts(); }}
      />
    </div>
  );
}
