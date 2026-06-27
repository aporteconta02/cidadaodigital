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
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [loadingSol, setLoadingSol] = useState(true);
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

  const fetchSolicitacoes = async () => {
    setLoadingSol(true);
    const { data } = await supabase
      .from("solicitacoes_eventos" as any)
      .select("*")
      .eq("status", "pendente")
      .order("created_at", { ascending: false });
    setSolicitacoes((data as any[]) || []);
    setLoadingSol(false);
  };

  useEffect(() => {
    fetchEventos();
  }, [filterAprovado]);

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const aprovarSolicitacao = async (s: any) => {
    const { error: insErr } = await supabase.from("eventos").insert({
      titulo: s.nome_evento,
      descricao: s.descricao || "",
      data_evento: s.data_evento || new Date().toISOString(),
      local_nome: s.local || "",
      endereco: s.local || "",
      categoria: "Comunitário",
      gratuito: true,
      aprovado: true,
      usuario_id: s.user_id,
    });
    if (insErr) { toast.error("Erro ao publicar evento"); return; }
    const { error: updErr } = await supabase
      .from("solicitacoes_eventos" as any)
      .update({ status: "aprovada" })
      .eq("id", s.id);
    if (updErr) { toast.error("Evento criado, mas falhou ao atualizar solicitação"); }
    toast.success("Solicitação aprovada e evento publicado");
    fetchSolicitacoes();
    fetchEventos();
  };

  const recusarSolicitacao = async (id: string) => {
    const { error } = await supabase
      .from("solicitacoes_eventos" as any)
      .update({ status: "recusada" })
      .eq("id", id);
    if (error) { toast.error("Erro ao recusar"); return; }
    toast.success("Solicitação recusada");
    fetchSolicitacoes();
  };


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
          <h2 className="text-2xl font-bold font-inter uppercase tracking-tight">Gestão de Eventos</h2>
          <p className="text-admin-text-secondary text-sm font-semibold mt-1">Aprove e destaque eventos da comunidade</p>
        </div>
      </div>

      {/* Solicitações de divulgação */}
      <div className="bg-admin-surface border border-admin-border-light rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-admin-border-light flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-tight">📩 Solicitações de Divulgação (pendentes)</h3>
          <span className="text-[10px] font-semibold text-admin-text-secondary">{solicitacoes.length}</span>
        </div>
        <div className="divide-y divide-admin-border-light">
          {loadingSol ? (
            <div className="px-6 py-6 text-sm text-admin-text-secondary animate-pulse">Carregando...</div>
          ) : solicitacoes.length === 0 ? (
            <div className="px-6 py-6 text-sm text-admin-text-secondary">Sem solicitações pendentes.</div>
          ) : (
            solicitacoes.map((s) => (
              <div key={s.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{s.nome_evento}</p>
                  <p className="text-[11px] text-admin-text-secondary truncate">
                    {s.data_evento ? format(new Date(s.data_evento), "dd/MM/yy HH:mm") : "Sem data"} · {s.local || "Sem local"} · {s.contato || "Sem contato"}
                  </p>
                  {s.descricao && <p className="text-[11px] text-admin-text-secondary mt-1 line-clamp-2">{s.descricao}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => aprovarSolicitacao(s)} className="px-3 py-2 text-[11px] font-semibold bg-admin-success/10 text-admin-success hover:bg-admin-success/20 rounded-lg">Aprovar e publicar</button>
                  <button onClick={() => recusarSolicitacao(s.id)} className="px-3 py-2 text-[11px] font-semibold bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20 rounded-lg">Recusar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-surface border border-admin-border-light p-4 rounded-lg shadow-sm">
        <select 
          value={filterAprovado}
          onChange={(e) => setFilterAprovado(e.target.value)}
          className="bg-admin-border-light border border-admin-border-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-admin-primary/50"
        >
          <option value="todos">Todos os Eventos</option>
          <option value="sim">Aprovados</option>
          <option value="nao">Pendentes / Rejeitados</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-admin-surface border border-admin-border-light rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-admin-hover">
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Evento</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Organizador</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Data do Evento</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-light">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-text-secondary animate-pulse">Carregando eventos...</td>
                </tr>
              ) : eventos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-text-secondary">Nenhum evento encontrado</td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento.id} className="hover:bg-admin-hover transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-admin-border-light border border-admin-border-light overflow-hidden flex items-center justify-center">
                          {evento.banner_url ? (
                            <img src={evento.banner_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Calendar size={18} className="text-admin-text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{evento.titulo}</p>
                          <p className="text-[10px] text-admin-text-secondary mt-1 ">{evento.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-admin-text-secondary">{evento.usuario?.nome}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-admin-text-secondary">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{format(new Date(evento.data_evento), 'dd/MM/yy HH:mm')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "w-fit px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                          evento.aprovado ? "bg-admin-success/10 text-admin-success border-admin-success/20" : "bg-admin-warning/10 text-admin-warning border-admin-warning/20"
                        )}>
                          {evento.aprovado ? "Aprovado" : "Pendente"}
                        </span>
                        {evento.destaque && (
                          <span className="w-fit px-2 py-0.5 rounded-full text-[9px] font-semibold bg-admin-primary/10 text-admin-primary border border-admin-primary/20 flex items-center gap-1">
                            <Star size={8} fill="currentColor" /> DESTAQUE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => setSelectedEvento(evento)}
                          className="p-2 hover:bg-admin-border-light rounded-lg transition-colors text-admin-text-secondary hover:text-admin-text"
                          title="Ver Detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        {!evento.aprovado && (
                          <button 
                            onClick={() => updateEvento(evento.id, { aprovado: true })}
                            className="p-2 hover:bg-admin-success/10 rounded-lg transition-colors text-admin-success"
                            title="Aprovar Evento"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => updateEvento(evento.id, { destaque: !evento.destaque })}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            evento.destaque ? "text-admin-primary bg-admin-primary/10" : "text-admin-text-secondary hover:bg-admin-border-light"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-admin-surface border border-admin-border-light w-full max-w-2xl rounded-lg overflow-hidden shadow-lg animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="relative h-48">
              {selectedEvento.banner_url ? (
                <img src={selectedEvento.banner_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-admin-primary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
              <button 
                onClick={() => setSelectedEvento(null)}
                className="absolute top-4 right-4 p-2 bg-admin-text/20 hover:bg-admin-text/30 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-8">
                  <h3 className="text-2xl font-semibold  uppercase tracking-tighter">{selectedEvento.titulo}</h3>
                  <div className="flex items-center gap-2 text-admin-text-secondary mt-1">
                    <span className="text-[10px] font-semibold">{selectedEvento.categoria}</span>
                    <span className="size-1 rounded-full bg-admin-border" />
                    <span className="text-[10px] font-semibold">{selectedEvento.gratuito ? 'Gratuito' : `R$ ${selectedEvento.preco_ingresso}`}</span>
                  </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-4">Sobre o Evento</h4>
                    <p className="text-sm text-admin-text-secondary leading-relaxed bg-admin-border-light p-4 rounded-lg border border-admin-border-light">
                      {selectedEvento.descricao || 'Sem descrição.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                   <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-4">Informações e Local</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Organizado por</p>
                          <p className="text-sm font-bold">{selectedEvento.usuario?.nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Local / Endereço</p>
                          <p className="text-sm font-bold leading-tight">{selectedEvento.local_nome}<br/><span className="text-[10px] text-admin-text-secondary font-normal">{selectedEvento.endereco}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Data e Hora</p>
                          <p className="text-sm font-bold">{format(new Date(selectedEvento.data_evento), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!selectedEvento.aprovado && (
                <div className="pt-6 border-t border-admin-border-light">
                   <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-4">Rejeitar Evento</h4>
                   <div className="space-y-4">
                      <textarea 
                        placeholder="Motivo da rejeição (será enviado ao organizador)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3.5 px-4 text-sm focus:outline-none focus:border-admin-danger/50 min-h-[80px] resize-none"
                      />
                      <button 
                        onClick={handleRejection}
                        className="w-full py-3 bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20 rounded-lg text-[10px] font-semibold transition-all"
                      >
                        Confirmar Rejeição
                      </button>
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-admin-hover border-t border-admin-border-light flex gap-3">
              {!selectedEvento.aprovado && (
                <button 
                  onClick={() => updateEvento(selectedEvento.id, { aprovado: true })}
                  className="flex-1 bg-success hover:bg-admin-success/90 text-admin-text py-3 rounded-lg text-xs font-semibold transition-all shadow-lg shadow-success/20"
                >
                  Aprovar Evento
                </button>
              )}
              {selectedEvento.aprovado && (
                <button 
                  onClick={() => updateEvento(selectedEvento.id, { aprovado: false })}
                  className="flex-1 bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20 py-3 rounded-lg text-xs font-semibold transition-all"
                >
                  Desativar Evento
                </button>
              )}
              <button 
                onClick={() => updateEvento(selectedEvento.id, { destaque: !selectedEvento.destaque })}
                className={cn(
                  "flex-1 py-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2",
                  selectedEvento.destaque ? "bg-primary text-admin-text shadow-lg shadow-primary/20" : "bg-admin-border-light text-admin-text-secondary hover:bg-admin-border-light"
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