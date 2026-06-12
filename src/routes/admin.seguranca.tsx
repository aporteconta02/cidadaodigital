import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ShieldAlert, 
  MapPin, 
  Trash2, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  X,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

const Map = lazy(() => import('@/components/Map'));

export const Route = createFileRoute("/admin/seguranca")({
  component: AdminSeguranca,
});

function AdminSeguranca() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBairro, setFilterBairro] = useState("todos");
  const [showRemoveModal, setShowRemoveModal] = useState<any>(null);
  const [removeReason, setRemoveReason] = useState("");

  const fetchAlertas = async () => {
    setLoading(true);
    let query = supabase.from("alertas_seguranca").select(`
      *,
      usuario:usuarios(nome, email)
    `);

    if (filterBairro !== "todos") {
      query = query.eq("bairro", filterBairro);
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (!error) setAlertas(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlertas();
  }, [filterBairro]);

  const removeAlerta = async () => {
    if (!removeReason) {
      toast.error("Informe o motivo da remoção");
      return;
    }

    const { error } = await supabase
      .from("alertas_seguranca")
      .update({ ativo: false })
      .eq("id", showRemoveModal.id);

    if (error) {
      toast.error("Erro ao remover alerta");
    } else {
      toast.success("Alerta removido com sucesso");
      fetchAlertas();
      setShowRemoveModal(null);
      setRemoveReason("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-space uppercase tracking-tight">Segurança do Bairro</h2>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">Gestão de alertas SOS e monitoramento geográfico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden shadow-xl h-[500px] relative">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-text-muted">Carregando mapa...</div>}>
            <Map alerts={alertas.filter(a => a.ativo)} isAdminView={true} />
          </Suspense>
          <div className="absolute top-4 right-4 z-[400] bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
             <div className="size-2 rounded-full bg-danger animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">{alertas.filter(a => a.ativo).length} Alertas Ativos</span>
          </div>
        </div>

        {/* Sidebar Alerts List */}
        <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-[500px]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Histórico Recente</h3>
              <div className="relative">
                 <Filter size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                 <select 
                  value={filterBairro}
                  onChange={(e) => setFilterBairro(e.target.value)}
                  className="bg-white/5 border border-white/5 rounded-lg pl-8 pr-2 py-1 text-[10px] font-bold focus:outline-none focus:border-primary/50"
                 >
                    <option value="todos">Todos Bairros</option>
                    {Array.from(new Set(alertas.map(a => a.bairro))).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                 </select>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {loading ? (
                <div className="space-y-4">
                   {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
              ) : alertas.length === 0 ? (
                <div className="text-center py-12 text-text-muted italic text-xs">Nenhum alerta encontrado</div>
              ) : (
                alertas.map(alerta => (
                  <div key={alerta.id} className={cn(
                    "p-4 rounded-2xl border transition-all group",
                    alerta.ativo ? "bg-danger/5 border-danger/10 hover:border-danger/30" : "bg-white/5 border-white/5 opacity-60"
                  )}>
                     <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "size-8 rounded-xl flex items-center justify-center",
                             alerta.ativo ? "bg-danger/20 text-danger" : "bg-white/10 text-text-muted"
                           )}>
                              <ShieldAlert size={16} />
                           </div>
                           <div>
                              <p className="text-xs font-bold uppercase">{alerta.tipo}</p>
                              <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">{alerta.bairro}</p>
                           </div>
                        </div>
                        {alerta.ativo && (
                          <button 
                            onClick={() => setShowRemoveModal(alerta)}
                            className="p-1.5 hover:bg-danger/10 text-danger rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <Trash2 size={14} />
                          </button>
                        )}
                     </div>
                     <p className="text-xs text-text-secondary mt-3 line-clamp-2">{alerta.descricao}</p>
                     <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex items-center gap-1.5">
                           <User size={10} className="text-text-muted" />
                           <span className="text-[9px] font-bold text-text-muted truncate max-w-[80px]">{alerta.usuario?.nome}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <Clock size={10} className="text-text-muted" />
                           <span className="text-[9px] font-bold text-text-muted">{format(new Date(alerta.criado_em), 'HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <AlertTriangle size={10} className="text-warning" />
                           <span className="text-[9px] font-black text-warning">{alerta.confirmacoes}</span>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-lg font-black italic uppercase tracking-tighter">Remover Alerta</h3>
                 <button onClick={() => setShowRemoveModal(null)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex items-start gap-4">
                    <AlertTriangle size={24} className="text-danger flex-shrink-0" />
                    <div>
                       <p className="text-xs font-bold text-danger uppercase tracking-widest">Atenção</p>
                       <p className="text-[10px] text-danger/80 mt-1 uppercase">Esta ação irá remover o alerta do mapa para todos os usuários.</p>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Motivo da Remoção</label>
                    <textarea 
                      placeholder="Ex: Trote, resolvido, duplicado..."
                      value={removeReason}
                      onChange={e => setRemoveReason(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:border-danger/50 min-h-[100px] resize-none"
                    />
                 </div>
              </div>
              <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                 <button onClick={() => setShowRemoveModal(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Cancelar</button>
                 <button onClick={removeAlerta} className="flex-1 py-3 bg-danger text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-danger/20">Remover Alerta</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}