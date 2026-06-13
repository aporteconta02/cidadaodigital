import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  MapPin,
  User,
  Image as ImageIcon,
  X,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/denuncias")({
  component: AdminDenuncias,
});

function AdminDenuncias() {
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [selectedDenuncia, setSelectedDenuncia] = useState<any>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchDenuncias = async () => {
    setLoading(true);
    let query = supabase.from("denuncias").select(`
      *,
      usuario:usuarios(nome, email)
    `);

    if (filterStatus !== "todos") {
      query = query.eq("status", filterStatus);
    }

    if (filterCategoria !== "todas") {
      query = query.eq("categoria", filterCategoria);
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar denúncias");
    } else {
      setDenuncias(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDenuncias();
  }, [filterStatus, filterCategoria]);

  const updateStatus = async (denunciaId: string, newStatus: string) => {
    setUpdateLoading(true);
    const { error } = await supabase
      .from("denuncias")
      .update({ status: newStatus })
      .eq("id", denunciaId);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success("Status atualizado com sucesso");
      fetchDenuncias();
      if (selectedDenuncia?.id === denunciaId) {
        setSelectedDenuncia({ ...selectedDenuncia, status: newStatus });
      }
    }
    setUpdateLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente': return 'text-admin-warning bg-admin-warning/10 border-admin-warning/20';
      case 'em_analise': return 'text-admin-primary bg-admin-primary/10 border-admin-primary/20';
      case 'resolvido': return 'text-admin-success bg-admin-success/10 border-admin-success/20';
      case 'rejeitado': return 'text-admin-danger bg-admin-danger/10 border-admin-danger/20';
      default: return 'text-admin-text-secondary bg-admin-border-light border-admin-border-light';
    }
  };

  const statusLabels: Record<string, string> = {
    'pendente': 'Pendente',
    'em_analise': 'Em Análise',
    'resolvido': 'Resolvido',
    'rejeitado': 'Rejeitado'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-inter uppercase tracking-tight">Gestão de Denúncias</h2>
          <p className="text-admin-text-secondary text-sm font-semibold mt-1">Monitore e responda às ocorrências do bairro</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-admin-surface border border-admin-border-light p-4 rounded-lg shadow-sm">
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-admin-border-light border border-admin-border-light rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-admin-primary/50"
        >
          <option value="todos">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="em_analise">Em Análise</option>
          <option value="resolvido">Resolvido</option>
          <option value="rejeitado">Rejeitado</option>
        </select>
        <select 
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="bg-admin-border-light border border-admin-border-light rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-admin-primary/50"
        >
          <option value="todas">Todas as Categorias</option>
          <option value="iluminação">Iluminação</option>
          <option value="buracos">Buracos</option>
          <option value="lixo">Lixo</option>
          <option value="segurança">Segurança</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-admin-surface border border-admin-border-light rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-admin-hover">
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Denúncia</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Data</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-light">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-text-secondary animate-pulse">Carregando denúncias...</td>
                </tr>
              ) : denuncias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-text-secondary">Nenhuma denúncia encontrada</td>
                </tr>
              ) : (
                denuncias.map((denuncia) => (
                  <tr key={denuncia.id} className="hover:bg-admin-hover transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-admin-border-light border border-admin-border-light overflow-hidden flex items-center justify-center">
                          {denuncia.foto_url ? (
                            <img src={denuncia.foto_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <ImageIcon size={18} className="text-admin-text-secondary" />
                          )}
                        </div>
                        <div className="max-w-xs">
                          <p className="text-sm font-bold truncate">{denuncia.descricao || 'Sem descrição'}</p>
                          <p className="text-[10px] text-admin-text-secondary mt-1 ">{denuncia.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-admin-text-secondary">{denuncia.usuario?.nome}</p>
                      <p className="text-[10px] text-admin-text-secondary mt-1">{denuncia.endereco}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                        getStatusColor(denuncia.status)
                      )}>
                        {statusLabels[denuncia.status] || denuncia.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-admin-text-secondary">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{format(new Date(denuncia.criado_em), 'dd/MM/yy HH:mm')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedDenuncia(denuncia)}
                        className="p-2 hover:bg-admin-border-light rounded-xl transition-colors text-admin-text-secondary hover:text-admin-text"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Denuncia Details Modal */}
      {selectedDenuncia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-admin-surface border border-admin-border-light w-full max-w-3xl rounded-xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-admin-border-light flex items-center justify-between">
               <div>
                 <h3 className="text-lg font-semibold  uppercase tracking-tighter">Detalhes da Denúncia</h3>
                 <p className="text-[10px] text-admin-text-secondary font-semibold">Protocolo: {selectedDenuncia.id.split('-')[0]}</p>
               </div>
               <button 
                onClick={() => setSelectedDenuncia(null)}
                className="p-2 hover:bg-admin-border-light rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {selectedDenuncia.foto_url && (
                    <div className="aspect-video rounded-lg overflow-hidden border border-admin-border-light group relative">
                      <img src={selectedDenuncia.foto_url} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-admin-text/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button className="bg-admin-border-light backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-semibold uppercase" onClick={() => window.open(selectedDenuncia.foto_url, '_blank')}>Ver original</button>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-3">Descrição do Cidadão</h4>
                    <p className="text-sm text-admin-text-secondary leading-relaxed bg-admin-border-light p-4 rounded-lg border border-admin-border-light">
                      {selectedDenuncia.descricao || 'Nenhuma descrição fornecida.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-admin-border-light p-3 rounded-lg border border-admin-border-light">
                        <p className="text-[10px] text-admin-text-secondary font-semibold mb-1">Categoria</p>
                        <p className="text-xs font-bold uppercase">{selectedDenuncia.categoria}</p>
                     </div>
                     <div className="bg-admin-border-light p-3 rounded-lg border border-admin-border-light">
                        <p className="text-[10px] text-admin-text-secondary font-semibold mb-1">Status Atual</p>
                        <span className={cn("text-[10px] font-semibold", getStatusColor(selectedDenuncia.status).split(' ')[0])}>
                           {statusLabels[selectedDenuncia.status]}
                        </span>
                     </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-4">Informações e Local</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Relatado por</p>
                          <p className="text-sm font-bold">{selectedDenuncia.usuario?.nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Endereço</p>
                          <p className="text-sm font-bold leading-tight">{selectedDenuncia.endereco}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Enviado em</p>
                          <p className="text-sm font-bold">{format(new Date(selectedDenuncia.criado_em), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-admin-border-light">
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-4">Atualizar Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                       {Object.entries(statusLabels).map(([value, label]) => (
                         <button
                           key={value}
                           onClick={() => updateStatus(selectedDenuncia.id, value)}
                           disabled={updateLoading || selectedDenuncia.status === value}
                           className={cn(
                             "py-2.5 rounded-xl text-[10px] font-semibold transition-all",
                             selectedDenuncia.status === value 
                              ? "bg-primary text-admin-text shadow-lg shadow-primary/20" 
                              : "bg-admin-border-light text-admin-text-secondary hover:bg-admin-border-light"
                           )}
                         >
                           {label}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-admin-hover border-t border-admin-border-light">
               <div className="relative">
                  <MessageSquare size={16} className="absolute left-4 top-4 text-admin-text-secondary" />
                  <textarea 
                    placeholder="Adicionar observação interna (não visível ao usuário)..."
                    className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-admin-primary/50 min-h-[100px] resize-none"
                  />
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}