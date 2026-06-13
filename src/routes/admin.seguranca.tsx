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
          <h2 className="text-2xl font-bold font-inter uppercase tracking-tight">Segurança do Bairro</h2>
          <p className="text-admin-text-admin-purple text-sm font-semibold mt-1">Gestão de alertas SOS e monitoramento geográfico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 bg-admin-surface border border-admin-border-light rounded-xl overflow-hidden shadow-sm h-[500px] relative">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-admin-text-admin-purple">Carregando mapa...</div>}>
            <Map 
              markers={alertas.filter(a => a.ativo).map(a => ({
                id: a.id,
                position: [Number(a.latitude), Number(a.longitude)],
                title: a.tipo,
                description: a.descricao,
                type: a.tipo.toLowerCase(),
                created_at: a.criado_em,
                confirmacoes: a.confirmacoes
              }))} 
              isAdminView={true} 
            />
          </Suspense>
          <div className="absolute top-4 right-4 z-[400] bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-admin-border-light flex items-center gap-2">
             <div className="size-2 rounded-full bg-danger animate-pulse" />
             <span className="text-[10px] font-semibold">{alertas.filter(a => a.ativo).length} Alertas Ativos</span>
          </div>
        </div>

        {/* Sidebar Alerts List */}
        <div className="bg-admin-surface border border-admin-border-light rounded-xl p-6 shadow-sm flex flex-col h-[500px]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-admin-purple ">Histórico Recente</h3>
              <div className="relative">
                 <Filter size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-admin-text-admin-purple" />
                 <select 
                  value={filterBairro}
                  onChange={(e) => setFilterBairro(e.target.value)}
                  className="bg-admin-border-light border border-admin-border-light rounded-lg pl-8 pr-2 py-1 text-[10px] font-bold focus:outline-none focus:border-admin-primary/50"
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
                   {[1, 2, 3].map(i => <div key={i} className="h-24 bg-admin-border-light rounded-lg animate-pulse" />)}
                </div>
              ) : alertas.length === 0 ? (
                <div className="text-center py-12 text-admin-text-admin-purple  text-xs">Nenhum alerta encontrado</div>
              ) : (
                alertas.map(alerta => (
                  <div key={alerta.id} className={cn(
                    "p-4 rounded-lg border transition-all group",
                    alerta.ativo ? "bg-admin-danger/5 border-admin-danger/10 hover:border-admin-danger/30" : "bg-admin-border-light border-admin-border-light opacity-60"
                  )}>
                     <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "size-8 rounded-xl flex items-center justify-center",
                             alerta.ativo ? "bg-admin-danger/20 text-admin-danger" : "bg-admin-border-light text-admin-text-admin-purple"
                           )}>
                              <ShieldAlert size={16} />
                           </div>
                           <div>
                              <p className="text-xs font-bold uppercase">{alerta.tipo}</p>
                              <p className="text-[9px] text-admin-text-admin-purple font-semibold">{alerta.bairro}</p>
                           </div>
                        </div>
                        {alerta.ativo && (
                          <button 
                            onClick={() => setShowRemoveModal(alerta)}
                            className="p-1.5 hover:bg-admin-danger/10 text-admin-danger rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <Trash2 size={14} />
                          </button>
                        )}
                     </div>
                     <p className="text-xs text-admin-text-admin-purple mt-3 line-clamp-2">{alerta.descricao}</p>
                     <div className="mt-4 flex items-center justify-between border-t border-admin-border-light pt-3">
                        <div className="flex items-center gap-1.5">
                           <User size={10} className="text-admin-text-admin-purple" />
                           <span className="text-[9px] font-bold text-admin-text-admin-purple truncate max-w-[80px]">{alerta.usuario?.nome}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <Clock size={10} className="text-admin-text-admin-purple" />
                           <span className="text-[9px] font-bold text-admin-text-admin-purple">{format(new Date(alerta.criado_em), 'HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <AlertTriangle size={10} className="text-admin-warning" />
                           <span className="text-[9px] font-semibold text-admin-warning">{alerta.confirmacoes}</span>
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-admin-surface border border-admin-border-light w-full max-w-md rounded-xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-admin-border-light flex items-center justify-between">
                 <h3 className="text-lg font-semibold  uppercase tracking-tighter">Remover Alerta</h3>
                 <button onClick={() => setShowRemoveModal(null)} className="p-2 hover:bg-admin-border-light rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="bg-admin-danger/10 border border-admin-danger/20 p-4 rounded-lg flex items-start gap-4">
                    <AlertTriangle size={24} className="text-admin-danger flex-shrink-0" />
                    <div>
                       <p className="text-xs font-bold text-admin-danger ">Atenção</p>
                       <p className="text-[10px] text-admin-danger/80 mt-1 uppercase">Esta ação irá remover o alerta do mapa para todos os usuários.</p>
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-semibold text-admin-text-admin-purple mb-2 block">Motivo da Remoção</label>
                    <textarea 
                      placeholder="Ex: Trote, resolvido, duplicado..."
                      value={removeReason}
                      onChange={e => setRemoveReason(e.target.value)}
                      className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3.5 px-4 text-sm focus:outline-none focus:border-admin-danger/50 min-h-[100px] resize-none"
                    />
                 </div>
              </div>
              <div className="p-6 bg-admin-hover border-t border-admin-border-light flex gap-3">
                 <button onClick={() => setShowRemoveModal(null)} className="flex-1 py-3 bg-admin-border-light hover:bg-admin-border-light rounded-lg text-xs font-semibold transition-all">Cancelar</button>
                 <button onClick={removeAlerta} className="flex-1 py-3 bg-danger text-admin-text rounded-lg text-xs font-semibold transition-all shadow-lg shadow-danger/20">Remover Alerta</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}