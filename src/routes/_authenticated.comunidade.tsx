import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { 
  Plus, MapPin, Clock, Megaphone, Calendar, ClipboardList, Vote, Phone, 
  Search, CheckCircle2, AlertCircle, ChevronRight, Share2, Camera, Image,
  X, Check, ArrowLeft, Filter, TrendingUp, Users, Info, MessageSquare, Heart
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/comunidade")({
  component: ComunidadePage,
});

type CityTab = 'denuncias' | 'eventos' | 'voz' | 'mural' | 'telefones';

function ComunidadePage() {
  const search = Route.useSearch() as any;
  const [activeTab, setActiveTab] = useState<CityTab>(search?.tab || 'denuncias');
  const autoOpen = !!search?.new;

  const tabs: { id: CityTab; label: string }[] = [
    { id: 'denuncias', label: 'Denúncias' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'voz', label: 'Voz do Povo' },
    { id: 'mural', label: 'Mural' },
    { id: 'telefones', label: 'Telefones' },
  ];

  return (
    <div className="pb-32 min-h-screen bg-bg-primary">
      <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex overflow-x-auto no-scrollbar px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-1 min-w-[100px] py-4 text-sm font-bold transition-colors text-center whitespace-nowrap",
                activeTab === tab.id ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'denuncias' && <DenunciasTab autoOpen={autoOpen} />}
            {activeTab === 'eventos' && <EventosTab autoOpen={autoOpen} />}
            {activeTab === 'voz' && <VozDoPovoTab defaultPesquisaId={search?.pesquisaId} />}
            {activeTab === 'mural' && <MuralTab autoOpen={autoOpen} />}
            {activeTab === 'telefones' && <TelefonesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================================
   DENÚNCIAS TAB
   ============================================================================ */

function DenunciasTab({ autoOpen = false }: { autoOpen?: boolean }) {
  const { usuario } = useAuth();
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'todas' | 'minhas'>('todas');
  const [isNewModalOpen, setIsNewModalOpen] = useState(autoOpen);
  const [step, setStep] = useState(1);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [resolveTarget, setResolveTarget] = useState<any>(null);
  const [resolveText, setResolveText] = useState('');

  // Form State
  const [categoria, setCategoria] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState('');
  const [localizacao, setLocalizacao] = useState<{lat: number, lng: number} | null>(null);
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categoriasDenuncia = [
    { label: 'Iluminação', icon: '💡' },
    { label: 'Lixo/Entulho', icon: '🗑️' },
    { label: 'Buraco/Vias', icon: '🕳️' },
    { label: 'Vandalismo', icon: '🎨' },
    { label: 'Saneamento', icon: '💧' },
    { label: 'Poda/Árvores', icon: '🌳' },
    { label: 'Outros', icon: '✨' },
  ];

  const fetchDenuncias = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    let query = supabase
      .from('denuncias')
      .select('*')
      .order('criado_em', { ascending: false })
      .range(page * 10, (page + 1) * 10 - 1);

    if (viewMode === 'minhas' && usuario?.id) {
      query = query.eq('usuario_id', usuario.id);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Erro ao carregar denúncias.");
    } else {
      setDenuncias(prev => isLoadMore ? [...prev, ...(data || [])] : (data || []));
      setHasMore((data?.length || 0) === 10);
    }
    setLoading(false);
  }, [page, viewMode, usuario?.id]);

  useEffect(() => {
    fetchDenuncias();
  }, [fetchDenuncias]);

  const handleNextStep = () => {
    if (step === 1 && !categoria) return toast.error("Selecione uma categoria");
    if (step === 3 && !endereco) return toast.error("Endereço é obrigatório");
    setStep(s => s + 1);
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocalizacao({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setEndereco(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (GPS)`);
        },
        () => toast.error("Erro ao obter localização.")
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      setFotoUrl(URL.createObjectURL(file));
    }
  };

  const submitDenuncia = async () => {
    if (!usuario?.id) return;
    setSubmitting(true);
    let uploadedUrl = '';

    if (foto) {
      const fileName = `${usuario.id}-${Date.now()}.${foto.name.split('.').pop()}`;
      const { data, error } = await supabase.storage.from('fotos-denuncias').upload(fileName, foto);
      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage.from('fotos-denuncias').getPublicUrl(data.path);
        uploadedUrl = publicUrl;
      }
    }

    const { error } = await supabase.from('denuncias').insert({
      usuario_id: usuario.id,
      categoria,
      descricao,
      foto_url: uploadedUrl,
      latitude: localizacao?.lat,
      longitude: localizacao?.lng,
      endereco,
      status: 'enviada'
    });

    if (error) {
      toast.error("Erro ao enviar denúncia.");
    } else {
      toast.success("Denúncia enviada com sucesso!");
      setIsNewModalOpen(false);
      setStep(1);
      fetchDenuncias();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
        <button 
          onClick={() => { setViewMode('todas'); setPage(0); }}
          className={cn("flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all", viewMode === 'todas' ? "bg-primary text-white" : "text-text-muted")}
        >
          Todas
        </button>
        <button 
          onClick={() => { setViewMode('minhas'); setPage(0); }}
          className={cn("flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all", viewMode === 'minhas' ? "bg-primary text-white" : "text-text-muted")}
        >
          Minhas
        </button>
      </div>

      <div className="space-y-6">
        {loading && page === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />)}
          </div>
        ) : denuncias.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <Megaphone size={48} className="mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Nenhuma denúncia por aqui. Ótimo sinal! ✅</p>
          </div>
        ) : (
          denuncias.map((item) => (
            <div key={item.id} className="bg-bg-card rounded-3xl overflow-hidden border border-white/5 shadow-sm active:scale-[0.99] transition-all">
              {item.foto_url && (
                <div className="h-48 w-full">
                  <img src={item.foto_url} className="w-full h-full object-cover" alt={item.categoria} />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {item.categoria}
                  </span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                    item.status === 'resolvida' ? "bg-success/10 text-success" :
                    item.status === 'rejeitada' ? "bg-danger/10 text-danger" :
                    item.status === 'em_analise' ? "bg-primary/10 text-primary" :
                    "bg-warning/10 text-warning"
                  )}>
                    {item.status}
                  </span>
                </div>
                <h4 className="font-bold text-base mb-2">{item.descricao || 'Sem descrição.'}</h4>
                <div className="flex items-center gap-1.5 text-text-muted mb-4">
                  <MapPin size={14} className="text-primary" />
                  <span className="text-xs font-medium line-clamp-1">{item.endereco}</span>
                </div>
                {item.observacao_resolucao && (
                  <div className="mb-4 p-3 bg-success/5 border border-success/20 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-success mb-1">Resolução</p>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.observacao_resolucao}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>{formatDistanceToNow(new Date(item.criado_em), { locale: ptBR, addSuffix: true })}</span>
                  </div>
                  <span>{item.confirmacoes || 0} confirmações</span>
                </div>
                {usuario?.id === item.usuario_id && item.status !== 'resolvida' && (
                  <button
                    onClick={() => { setResolveTarget(item); setResolveText(''); }}
                    className="mt-4 w-full py-3 bg-success/10 text-success font-black rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                  >
                    Marcar como Resolvida
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        
        {hasMore && (
          <button 
            onClick={() => setPage(p => p + 1)}
            className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-white/10"
          >
            Ver mais denúncias
          </button>
        )}
      </div>

      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogTrigger asChild>
          <button className="fixed bottom-24 right-6 size-16 rounded-full bg-primary text-white shadow-glow flex items-center justify-center active:scale-90 transition-transform z-40">
            <Plus size={32} strokeWidth={3} />
          </button>
        </DialogTrigger>
        <DialogContent className="bg-bg-elevated border-border-custom rounded-t-[40px] p-0 overflow-hidden sm:rounded-3xl max-h-[90vh] flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black font-space uppercase italic text-white">Nova Denúncia</h2>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Passo {step} de 5</p>
            </div>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-white">
                <ArrowLeft size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {categoriasDenuncia.map(c => (
                  <button 
                    key={c.label}
                    onClick={() => { setCategoria(c.label); handleNextStep(); }}
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all",
                      categoria === c.label ? "border-primary bg-primary/10" : "border-white/5 bg-white/5"
                    )}
                  >
                    <span className="text-3xl">{c.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-tight text-white">{c.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="h-64 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden relative">
                  {fotoUrl ? (
                    <>
                      <img src={fotoUrl} className="w-full h-full object-cover" alt="Preview" />
                      <button onClick={() => {setFoto(null); setFotoUrl('');}} className="absolute top-4 right-4 size-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-md">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <Camera size={40} className="mx-auto mb-4 text-text-muted opacity-40" />
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Uma imagem vale mais que mil palavras</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10">
                    <Camera size={20} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Tirar Foto</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <label className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10">
                    <Image size={20} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Galeria</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <button onClick={handleNextStep} className="w-full py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest shadow-glow">Próximo</button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Localização Atual</p>
                    <p className="text-xs font-bold text-white truncate">{endereco || 'Clique abaixo para capturar...'}</p>
                  </div>
                </div>
                <button onClick={captureLocation} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2">
                  <MapPin size={16} />
                  Capturar GPS agora
                </button>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Endereço/Referência</label>
                  <input 
                    type="text" 
                    value={endereco} 
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Em frente ao Mercado Silva..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <button onClick={handleNextStep} className="w-full py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest shadow-glow">Próximo</button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Descrição do Problema</label>
                  <textarea 
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    maxLength={500}
                    placeholder="Nos conte mais detalhes sobre o ocorrido..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-5 text-sm text-white focus:outline-none focus:border-primary/50 resize-none"
                  />
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{descricao.length}/500</span>
                  </div>
                </div>
                <button onClick={handleNextStep} className="w-full py-4 bg-primary text-white font-black rounded-2xl uppercase tracking-widest shadow-glow">Revisar</button>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 pb-6">
                <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Categoria</span>
                    <span className="text-xs font-bold text-primary">{categoria}</span>
                  </div>
                  {fotoUrl && (
                    <div className="h-32 rounded-2xl overflow-hidden">
                      <img src={fotoUrl} className="w-full h-full object-cover" alt="Review" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Local</span>
                    <p className="text-xs font-bold text-white">{endereco}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Descrição</span>
                    <p className="text-xs font-medium text-white/70 leading-relaxed italic">"{descricao || 'Sem descrição'}"</p>
                  </div>
                </div>
                <button 
                  disabled={submitting}
                  onClick={submitDenuncia} 
                  className="w-full py-5 bg-success text-white font-black rounded-2xl uppercase tracking-widest shadow-[0_8px_24px_rgba(0,214,143,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  {submitting ? 'Enviando...' : 'Protocolar Denúncia'}
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resolveTarget} onOpenChange={(o) => !o && setResolveTarget(null)}>
        <DialogContent className="bg-bg-elevated border-border-custom rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-space uppercase italic text-white">Resolver Denúncia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-xs text-text-muted">Conte o que foi feito para resolver o problema. Essa observação ficará visível para todos.</p>
            <textarea
              value={resolveText}
              onChange={(e) => setResolveText(e.target.value)}
              maxLength={500}
              placeholder="Ex: A prefeitura passou e tapou o buraco hoje pela manhã..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-success/50 resize-none"
            />
            <button
              onClick={async () => {
                if (!resolveText.trim()) return toast.error("Descreva a resolução");
                const { error } = await supabase.from('denuncias').update({
                  status: 'resolvida',
                  observacao_resolucao: resolveText.trim(),
                  resolvido_em: new Date().toISOString()
                }).eq('id', resolveTarget.id);
                if (error) return toast.error("Erro ao resolver denúncia");
                toast.success("Denúncia marcada como resolvida!");
                setResolveTarget(null);
                fetchDenuncias();
              }}
              className="w-full py-4 bg-success text-white font-black rounded-2xl uppercase tracking-widest shadow-glow active:scale-95 transition-all"
            >
              Confirmar Resolução
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================================
   EVENTOS TAB
   ============================================================================ */

function EventosTab() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes'>('todos');

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('eventos')
      .select('*')
      .eq('aprovado', true)
      .order('data_evento', { ascending: true });

    const now = new Date();
    if (filter === 'hoje') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();
      query = query.gte('data_evento', startOfDay).lte('data_evento', endOfDay);
    } else if (filter === 'semana') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('data_evento', now.toISOString()).lte('data_evento', nextWeek);
    } else if (filter === 'mes') {
      const nextMonth = new Date(now.setMonth(now.getMonth() + 1)).toISOString();
      query = query.gte('data_evento', now.toISOString()).lte('data_evento', nextMonth);
    }

    const { data, error } = await query;
    if (!error) setEventos(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
        {['Todos', 'Hoje', 'Semana', 'Mês'].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f.toLowerCase() as any)}
            className={cn(
              "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
              filter === f.toLowerCase() ? "bg-primary border-primary text-white" : "bg-white/5 border-white/5 text-text-muted"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-56 bg-white/5 rounded-3xl animate-pulse" />)}
          </div>
        ) : eventos.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <Calendar size={48} className="mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Nenhum evento em breve! 🎉</p>
          </div>
        ) : (
          eventos.map((event) => (
            <div key={event.id} className="bg-bg-card rounded-3xl overflow-hidden border border-white/5 shadow-sm active:scale-[0.98] transition-all group">
              <div className="relative h-48">
                <img src={event.banner_url || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800"} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={event.titulo} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <div className="absolute top-4 left-4">
                    <span className="bg-white px-3 py-1.5 rounded-xl text-[10px] font-black text-black uppercase tracking-widest shadow-xl">
                      {format(new Date(event.data_evento), "dd 'DE' MMM", { locale: ptBR })}
                    </span>
                  </div>
                  <h4 className="text-xl font-black font-space text-white uppercase tracking-tighter leading-tight mb-1">{event.titulo}</h4>
                  <div className="flex items-center gap-1.5 text-white/70">
                    <MapPin size={12} className="text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{event.local_nome || event.endereco}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-full">{event.categoria}</span>
                <button className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 shadow-lg">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   VOZ DO POVO TAB
   ============================================================================ */

function VozDoPovoTab({ defaultPesquisaId }: { defaultPesquisaId?: string }) {
  const { usuario } = useAuth();
  const [pesquisas, setPesquisas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, any>>({});

  const fetchPesquisas = useCallback(async () => {
    setLoading(true);
    const { data: pData, error: pError } = await supabase
      .from('pesquisas')
      .select('*')
      .eq('ativa', true)
      .order('criado_em', { ascending: false });

    if (!pError && pData && usuario?.id) {
      setPesquisas(pData);
      const { data: vData } = await supabase
        .from('respostas_pesquisa')
        .select('pesquisa_id, resposta')
        .eq('usuario_id', usuario.id);
      
      const votes: Record<string, any> = {};
      vData?.forEach(v => { votes[v.pesquisa_id] = v.resposta; });
      setUserVotes(votes);
    }
    setLoading(false);
  }, [usuario?.id]);

  useEffect(() => { 
    fetchPesquisas().then(() => {
      if (defaultPesquisaId) {
        const el = document.getElementById(`poll-${defaultPesquisaId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }); 
  }, [fetchPesquisas, defaultPesquisaId]);

  const navigate = useNavigate();

  const handleVote = async (pesquisaId: string, resposta: any) => {
    if (!usuario?.id) return;
    const { error } = await supabase.from('respostas_pesquisa').insert({
      pesquisa_id: pesquisaId,
      usuario_id: usuario.id,
      resposta: { valor: resposta },
      bairro: usuario.bairro
    });

    if (error) {
      toast.error("Voto já registrado ou erro no servidor.");
    } else {
      toast.success("Voto computado! Obrigado por participar.");
      fetchPesquisas();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-hero p-8 rounded-[40px] border border-white/10 shadow-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black font-space uppercase tracking-tight text-white italic">Voz do Povo</h3>
          <p className="text-xs text-white/70 font-bold uppercase tracking-widest mt-1">Sua opinião constrói o bairro</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => <div key={i} className="h-64 bg-white/5 rounded-[32px] animate-pulse" />)}
        </div>
      ) : pesquisas.length === 0 ? (
        <div className="py-20 text-center opacity-40">
          <Vote size={48} className="mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhuma pesquisa ativa no momento</p>
        </div>
      ) : (
        pesquisas.map((poll) => {
          const options = poll.opcoes as any[];
          const hasVoted = !!userVotes[poll.id];

          return (
            <div key={poll.id} id={`poll-${poll.id}`} className={cn(
              "bg-bg-card border border-white/5 rounded-[40px] p-7 shadow-sm transition-all",
              defaultPesquisaId === poll.id && "ring-2 ring-primary ring-offset-4 ring-offset-bg-primary"
            )}>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-widest rounded-lg">{poll.categoria}</span>
                {hasVoted && <span className="flex items-center gap-1 text-success text-[9px] font-black uppercase tracking-widest bg-success/10 px-3 py-1 rounded-lg">
                  <CheckCircle2 size={10} /> Votado
                </span>}
              </div>
              <h4 className="font-bold text-xl mb-6 leading-tight text-white">{poll.titulo}</h4>
              
              <div className="space-y-4 mb-8">
                {options.map((opt, i) => (
                  <button 
                    key={i}
                    disabled={hasVoted}
                    onClick={() => handleVote(poll.id, opt.label)}
                    className={cn(
                      "relative w-full p-4 rounded-2xl bg-white/5 overflow-hidden group active:scale-[0.98] transition-all border border-white/5",
                      hasVoted && userVotes[poll.id] === opt.label && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-sm font-bold text-white">{opt.label}</span>
                      {hasVoted && <span className="text-xs font-black text-primary">25%</span>}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">
                <div className="flex items-center gap-1.5">
                  <Users size={12} />
                  <span>1.2k participantes</span>
                </div>
                <div className="flex items-center gap-1.5 text-warning">
                  <Clock size={12} />
                  <span>3 dias restantes</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ============================================================================
   MURAL TAB
   ============================================================================ */

function MuralTab() {
  const { usuario } = useAuth();
  const [avisos, setAvisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', 'Pets', 'Emprego', 'Venda', 'Alerta', 'Geral'];

  const fetchAvisos = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('mural_avisos')
      .select('*')
      .eq('ativo', true)
      .order('criado_em', { ascending: false });

    if (filter !== 'Todos') {
      query = query.eq('tipo', filter);
    }

    const { data, error } = await query;
    if (!error) setAvisos(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchAvisos(); }, [fetchAvisos]);

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all",
              filter === cat ? "bg-success border-success text-white shadow-glow-sm" : "bg-white/5 border-white/5 text-text-muted hover:border-white/20"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : avisos.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <ClipboardList size={48} className="mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Mural vazio por enquanto. Seja o primeiro a publicar um aviso! 📋</p>
          </div>
        ) : (
          avisos.map((post) => (
            <div key={post.id} className="bg-bg-card border border-white/5 p-5 rounded-3xl active:bg-white/[0.02] transition-all flex gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                    post.tipo === 'Alerta' ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
                  )}>
                    {post.tipo}
                  </span>
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(post.criado_em), { locale: ptBR, addSuffix: true })}</span>
                </div>
                <h5 className="text-base font-bold text-white leading-snug">{post.titulo}</h5>
                <p className="text-sm text-text-muted line-clamp-3 leading-relaxed">{post.texto}</p>
                <div className="flex items-center gap-1.5 text-text-muted/60">
                  <MapPin size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{post.bairro}</span>
                </div>
              </div>
              {post.foto_url && (
                <div className="size-24 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                  <img src={post.foto_url} className="w-full h-full object-cover" alt="Post" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   TELEFONES TAB
   ============================================================================ */

function TelefonesTab() {
  const [telefones, setTelefones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTelefones = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('telefones_uteis')
      .select('*')
      .order('destaque', { ascending: false })
      .order('ordem', { ascending: true });
    
    if (!error) setTelefones(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTelefones(); }, []);

  const filteredTelefones = telefones.filter(t => 
    t.nome.toLowerCase().includes(search.toLowerCase()) || 
    t.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const groups = filteredTelefones.reduce((acc: any, curr) => {
    if (!acc[curr.categoria]) acc[curr.categoria] = [];
    acc[curr.categoria].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-10">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar telefone ou categoria..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="py-20 text-center opacity-40">
          <Phone size={48} className="mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhum telefone encontrado</p>
        </div>
      ) : (
        Object.entries(groups).map(([cat, items]: [string, any]) => (
          <div key={cat} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic px-2">{cat}</h3>
            <div className="space-y-3">
              {items.map((item: any) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "bg-bg-card p-5 rounded-[32px] flex items-center justify-between border border-white/5 shadow-sm active:scale-[0.98] transition-all",
                    item.destaque && "border-l-4 border-l-danger bg-danger/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Phone size={20} className={item.destaque ? "text-danger" : "text-primary"} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white leading-none mb-1">{item.nome}</h4>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{item.telefone}</p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${item.telefone.replace(/\D/g,'')}`}
                    className="bg-success text-white size-12 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,214,143,0.3)] active:scale-90 transition-transform"
                  >
                    <Phone size={20} fill="currentColor" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
