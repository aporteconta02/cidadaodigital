import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Star, 
  MapPin, 
  User, 
  DollarSign,
  Eye,
  X,
  Clock,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/eventos")({
  component: AdminEventos,
});

function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAprovado, setFilterAprovado] = useState("todos");
  const [selectedEvento, setSelectedEvento] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchEventos = async () => {
    setLoading(true);
    let query = supabase.from("eventos").select(`
      *,
      usuario:usuarios(nome, email)
    `);

    if (filterAprovado !== "todos") {
      query = query.eq("aprovado", filterAprovado === "sim");
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar eventos");
    } else {
      setEventos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEventos();
  }, [filterAprovado]);

  const updateEvento = async (eventoId: string, updates: any) => {
    const { error } = await supabase
      .from("eventos")
      .update(updates)
      .eq("id", eventoId);

    if (error) {
      toast.error("Erro ao atualizar evento");
    } else {
      toast.success("Evento atualizado com sucesso");
      fetchEventos();
      if (selectedEvento?.id === eventoId) {
        setSelectedEvento({ ...selectedEvento, ...updates });
      }
    }
  };

  const handleRejection = async () => {
    if (!rejectionReason) {
      toast.error("Informe o motivo da rejeição");
      return;
    }
    await updateEvento(selectedEvento.id, { aprovado: false });
    // Aqui poderia enviar uma notificação para o usuário com o motivo
    toast.info("Evento rejeitado. Motivo registrado.");
    setRejectionReason("");
    setSelectedEvento(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-space uppercase tracking-tight">Gestão de Eventos</h2>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">Aprove e destaque eventos da comunidade</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-2xl shadow-xl">
        <select 
          value={filterAprovado}
          onChange={(e) => setFilterAprovado(e.target.value)}
          className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="todos">Todos os Eventos</option>
          <option value="sim">Aprovados</option>
          <option value="nao">Pendentes / Rejeitados</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Evento</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Organizador</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Data do Evento</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted animate-pulse">Carregando eventos...</td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">Nenhum evento encontrado</td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center">
                          {evento.banner_url ? (
                            <img src={evento.banner_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Calendar size={18} className="text-text-muted" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{evento.titulo}</p>
                          <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">{evento.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-text-secondary">{evento.usuario?.nome}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{format(new Date(evento.data_evento), 'dd/MM/yy HH:mm')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          evento.aprovado ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                        )}>
                          {evento.aprovado ? "Aprovado" : "Pendente"}
                        </span>
                        {evento.destaque && (
                          <span className="w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            <Star size={8} fill="currentColor" /> DESTAQUE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => setSelectedEvento(evento)}
                          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
                          title="Ver Detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        {!evento.aprovado && (
                          <button 
                            onClick={() => updateEvento(evento.id, { aprovado: true })}
                            className="p-2 hover:bg-success/10 rounded-xl transition-colors text-success"
                            title="Aprovar Evento"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => updateEvento(evento.id, { destaque: !evento.destaque })}
                          className={cn(
                            "p-2 rounded-xl transition-colors",
                            evento.destaque ? "text-primary bg-primary/10" : "text-text-muted hover:bg-white/5"
                          )}
                          title={evento.destaque ? "Remover Destaque" : "Marcar como Destaque"}
                        >
                          <Star size={16} fill={evento.destaque ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evento Details Modal */}
      {selectedEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="relative h-48">
              {selectedEvento.banner_url ? (
                <img src={selectedEvento.banner_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-gradient-hero" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
              <button 
                onClick={() => setSelectedEvento(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-8">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">{selectedEvento.titulo}</h3>
                  <div className="flex items-center gap-2 text-text-muted mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedEvento.categoria}</span>
                    <span className="size-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedEvento.gratuito ? 'Gratuito' : `R$ ${selectedEvento.preco_ingresso}`}</span>
                  </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic mb-4">Sobre o Evento</h4>
                    <p className="text-sm text-text-secondary leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                      {selectedEvento.descricao || 'Sem descrição.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                   <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic mb-4">Informações e Local</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-primary" />
                        <div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Organizado por</p>
                          <p className="text-sm font-bold">{selectedEvento.usuario?.nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-primary" />
                        <div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Local / Endereço</p>
                          <p className="text-sm font-bold leading-tight">{selectedEvento.local_nome}<br/><span className="text-[10px] text-text-muted font-normal">{selectedEvento.endereco}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-primary" />
                        <div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Data e Hora</p>
                          <p className="text-sm font-bold">{format(new Date(selectedEvento.data_evento), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!selectedEvento.aprovado && (
                <div className="pt-6 border-t border-white/5">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic mb-4">Rejeitar Evento</h4>
                   <div className="space-y-4">
                      <textarea 
                        placeholder="Motivo da rejeição (será enviado ao organizador)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:border-danger/50 min-h-[80px] resize-none"
                      />
                      <button 
                        onClick={handleRejection}
                        className="w-full py-3 bg-danger/10 text-danger hover:bg-danger/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Confirmar Rejeição
                      </button>
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
              {!selectedEvento.aprovado && (
                <button 
                  onClick={() => updateEvento(selectedEvento.id, { aprovado: true })}
                  className="flex-1 bg-success hover:bg-success/90 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-success/20"
                >
                  Aprovar Evento
                </button>
              )}
              {selectedEvento.aprovado && (
                <button 
                  onClick={() => updateEvento(selectedEvento.id, { aprovado: false })}
                  className="flex-1 bg-danger/10 text-danger hover:bg-danger/20 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Desativar Evento
                </button>
              )}
              <button 
                onClick={() => updateEvento(selectedEvento.id, { destaque: !selectedEvento.destaque })}
                className={cn(
                  "flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  selectedEvento.destaque ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-text-muted hover:bg-white/10"
                )}
              >
                <Star size={16} fill={selectedEvento.destaque ? "currentColor" : "none"} />
                {selectedEvento.destaque ? "Remover Destaque" : "Destacar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}