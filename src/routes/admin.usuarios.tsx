import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Ban, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuarios,
});

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [filterAssinante, setFilterAssinante] = useState("todos");
  const [filterAtivo, setFilterAtivo] = useState("todos");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    let query = supabase.from("usuarios").select("*");

    if (searchTerm) {
      query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    if (filterType !== "todos") {
      query = query.eq("tipo", filterType);
    }

    if (filterAssinante !== "todos") {
      query = query.eq("assinante_plus", filterAssinante === "sim");
    }

    if (filterAtivo !== "todos") {
      query = query.eq("ativo", filterAtivo === "sim");
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar usuários");
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, [searchTerm, filterType, filterAssinante, filterAtivo]);

  const toggleStatus = async (user: any) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ ativo: !user.ativo })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success(`Usuário ${user.ativo ? 'banido' : 'desbanido'} com sucesso`);
      fetchUsuarios();
    }
  };

  const toggleAssinatura = async (user: any) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ 
        assinante_plus: !user.assinante_plus,
        validade_assinatura: !user.assinante_plus ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao atualizar assinatura");
    } else {
      toast.success(`Assinatura ${user.assinante_plus ? 'removida' : 'ativada'} com sucesso`);
      fetchUsuarios();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-inter uppercase tracking-tight">Gestão de Usuários</h2>
          <p className="text-admin-text-admin-purple text-sm font-semibold mt-1">Gerencie membros, administradores e comerciantes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-admin-surface border border-admin-border-light p-4 rounded-lg shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-admin-purple" />
          <input 
            type="text" 
            placeholder="Nome ou Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-admin-border-light border border-admin-border-light rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-admin-primary/50"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-admin-border-light border border-admin-border-light rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-admin-primary/50"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="cidadao">Cidadão</option>
          <option value="comerciante">Comerciante</option>
        </select>
        <select 
          value={filterAssinante}
          onChange={(e) => setFilterAssinante(e.target.value)}
          className="bg-admin-border-light border border-admin-border-light rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-admin-primary/50"
        >
          <option value="todos">Assinatura: Todas</option>
          <option value="sim">Assinante Plus</option>
          <option value="nao">Não Assinante</option>
        </select>
        <select 
          value={filterAtivo}
          onChange={(e) => setFilterAtivo(e.target.value)}
          className="bg-admin-border-light border border-admin-border-light rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-admin-primary/50"
        >
          <option value="todos">Status: Todos</option>
          <option value="sim">Ativos</option>
          <option value="nao">Banidos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-admin-surface border border-admin-border-light rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-admin-hover">
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-admin-purple">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-admin-purple">Localização</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-admin-purple">Tipo / Plano</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-admin-purple">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-admin-purple text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-light">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-text-admin-purple animate-pulse">Carregando usuários...</td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-text-admin-purple">Nenhum usuário encontrado</td>
                </tr>
              ) : (
                usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-admin-hover transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-admin-primary flex items-center justify-center text-xs font-semibold border border-admin-border-light overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            user.nome.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{user.nome}</p>
                          <p className="text-[10px] text-admin-text-admin-purple mt-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-admin-text-admin-purple">{user.cidade}</p>
                      <p className="text-[10px] text-admin-text-admin-purple mt-1 ">{user.bairro}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={cn(
                          "w-fit px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                          user.tipo === "comerciante" ? "bg-admin-purple/10 text-admin-purple border-admin-purple/20" : "bg-admin-primary/10 text-admin-primary border-admin-primary/20"
                        )}>
                          {user.tipo}
                        </span>
                        {user.assinante_plus && (
                          <span className="w-fit px-2 py-0.5 rounded-full text-[9px] font-semibold bg-admin-success/10 text-admin-success border border-admin-success/20">
                            PLUS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-2 rounded-full", user.ativo ? "bg-success" : "bg-danger")} />
                        <span className={cn("text-[10px] font-semibold", user.ativo ? "text-admin-success" : "text-admin-danger")}>
                          {user.ativo ? "Ativo" : "Banido"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-admin-border-light rounded-xl transition-colors text-admin-text-admin-purple hover:text-admin-text"
                          title="Ver Perfil"
                        >
                          <User size={16} />
                        </button>
                        <button 
                          onClick={() => toggleAssinatura(user)}
                          className={cn(
                            "p-2 rounded-xl transition-colors",
                            user.assinante_plus ? "text-admin-danger hover:bg-admin-danger/10" : "text-admin-success hover:bg-admin-success/10"
                          )}
                          title={user.assinante_plus ? "Remover Assinatura" : "Ativar Assinatura"}
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button 
                          onClick={() => toggleStatus(user)}
                          className={cn(
                            "p-2 rounded-xl transition-colors",
                            user.ativo ? "text-admin-danger hover:bg-admin-danger/10" : "text-admin-success hover:bg-admin-success/10"
                          )}
                          title={user.ativo ? "Banir" : "Desbanir"}
                        >
                          {user.ativo ? <Ban size={16} /> : <CheckCircle2 size={16} />}
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-admin-surface border border-admin-border-light w-full max-w-lg rounded-xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-300">
            <div className="relative h-32 bg-admin-primary">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2 bg-admin-text/20 hover:bg-admin-text/30 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-8 pb-8 -mt-12">
              <div className="size-24 rounded-xl bg-admin-primary border-4 border-[#0A0A0F] shadow-sm mb-4 overflow-hidden flex items-center justify-center text-2xl font-semibold">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  selectedUser.nome.charAt(0)
                )}
              </div>
              <h3 className="text-2xl font-semibold  uppercase tracking-tighter">{selectedUser.nome}</h3>
              <p className="text-admin-text-admin-purple text-xs font-semibold mt-1">ID: {selectedUser.id}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-admin-border-light flex items-center justify-center text-admin-primary">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-admin-text-admin-purple font-semibold">Email</p>
                      <p className="text-sm font-bold">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-admin-border-light flex items-center justify-center text-admin-primary">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-admin-text-admin-purple font-semibold">Telefone</p>
                      <p className="text-sm font-bold">{selectedUser.telefone || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-admin-border-light flex items-center justify-center text-admin-primary">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-admin-text-admin-purple font-semibold">Local</p>
                      <p className="text-sm font-bold">{selectedUser.cidade} - {selectedUser.bairro}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-admin-border-light flex items-center justify-center text-admin-primary">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-admin-text-admin-purple font-semibold">Membro desde</p>
                      <p className="text-sm font-bold">{format(new Date(selectedUser.criado_em), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.assinante_plus && (
                <div className="mt-8 p-4 bg-admin-success/10 border border-admin-success/20 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-admin-success ">Assinante Plus Ativo</p>
                    <p className="text-[10px] text-admin-success/60 mt-1 uppercase">Válido até: {selectedUser.validade_assinatura ? format(new Date(selectedUser.validade_assinatura), 'dd/MM/yyyy') : '--'}</p>
                  </div>
                  <div className="size-10 bg-admin-success/20 rounded-xl flex items-center justify-center text-admin-success">
                    <ShieldCheck size={24} />
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => toggleStatus(selectedUser)}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-xs font-semibold transition-all",
                    selectedUser.ativo ? "bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20" : "bg-admin-success/10 text-admin-success hover:bg-admin-success/20"
                  )}
                >
                  {selectedUser.ativo ? "Banir Usuário" : "Desbanir Usuário"}
                </button>
                <button 
                  onClick={() => toggleAssinatura(selectedUser)}
                  className="flex-1 py-3 bg-admin-border-light hover:bg-admin-border-light text-admin-text rounded-lg text-xs font-semibold transition-all"
                >
                  {selectedUser.assinante_plus ? "Remover Plus" : "Ativar Plus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}