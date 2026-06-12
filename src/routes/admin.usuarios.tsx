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
          <h2 className="text-2xl font-bold font-space uppercase tracking-tight">Gestão de Usuários</h2>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">Gerencie membros, administradores e comerciantes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0A0A0F] border border-white/5 p-4 rounded-2xl shadow-xl">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Nome ou Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="todos">Todos os Tipos</option>
          <option value="cidadao">Cidadão</option>
          <option value="comerciante">Comerciante</option>
        </select>
        <select 
          value={filterAssinante}
          onChange={(e) => setFilterAssinante(e.target.value)}
          className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="todos">Assinatura: Todas</option>
          <option value="sim">Assinante Plus</option>
          <option value="nao">Não Assinante</option>
        </select>
        <select 
          value={filterAtivo}
          onChange={(e) => setFilterAtivo(e.target.value)}
          className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="todos">Status: Todos</option>
          <option value="sim">Ativos</option>
          <option value="nao">Banidos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Localização</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Tipo / Plano</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted animate-pulse">Carregando usuários...</td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">Nenhum usuário encontrado</td>
                </tr>
              ) : (
                usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-hero flex items-center justify-center text-xs font-black border border-white/10 overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            user.nome.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{user.nome}</p>
                          <p className="text-[10px] text-text-muted mt-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-text-secondary">{user.cidade}</p>
                      <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">{user.bairro}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={cn(
                          "w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          user.tipo === "comerciante" ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-primary/10 text-primary border-primary/20"
                        )}>
                          {user.tipo}
                        </span>
                        {user.assinante_plus && (
                          <span className="w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20">
                            PLUS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-2 rounded-full", user.ativo ? "bg-success" : "bg-danger")} />
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", user.ativo ? "text-success" : "text-danger")}>
                          {user.ativo ? "Ativo" : "Banido"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
                          title="Ver Perfil"
                        >
                          <User size={16} />
                        </button>
                        <button 
                          onClick={() => toggleAssinatura(user)}
                          className={cn(
                            "p-2 rounded-xl transition-colors",
                            user.assinante_plus ? "text-danger hover:bg-danger/10" : "text-success hover:bg-success/10"
                          )}
                          title={user.assinante_plus ? "Remover Assinatura" : "Ativar Assinatura"}
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button 
                          onClick={() => toggleStatus(user)}
                          className={cn(
                            "p-2 rounded-xl transition-colors",
                            user.ativo ? "text-danger hover:bg-danger/10" : "text-success hover:bg-success/10"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="relative h-32 bg-gradient-hero">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-8 pb-8 -mt-12">
              <div className="size-24 rounded-3xl bg-gradient-hero border-4 border-[#0A0A0F] shadow-xl mb-4 overflow-hidden flex items-center justify-center text-2xl font-black">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  selectedUser.nome.charAt(0)
                )}
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">{selectedUser.nome}</h3>
              <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">ID: {selectedUser.id}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Email</p>
                      <p className="text-sm font-bold">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Telefone</p>
                      <p className="text-sm font-bold">{selectedUser.telefone || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Local</p>
                      <p className="text-sm font-bold">{selectedUser.cidade} - {selectedUser.bairro}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Membro desde</p>
                      <p className="text-sm font-bold">{format(new Date(selectedUser.criado_em), 'dd/MM/yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.assinante_plus && (
                <div className="mt-8 p-4 bg-success/10 border border-success/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-success uppercase tracking-widest">Assinante Plus Ativo</p>
                    <p className="text-[10px] text-success/60 mt-1 uppercase">Válido até: {selectedUser.validade_assinatura ? format(new Date(selectedUser.validade_assinatura), 'dd/MM/yyyy') : '--'}</p>
                  </div>
                  <div className="size-10 bg-success/20 rounded-xl flex items-center justify-center text-success">
                    <ShieldCheck size={24} />
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => toggleStatus(selectedUser)}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                    selectedUser.ativo ? "bg-danger/10 text-danger hover:bg-danger/20" : "bg-success/10 text-success hover:bg-success/20"
                  )}
                >
                  {selectedUser.ativo ? "Banir Usuário" : "Desbanir Usuário"}
                </button>
                <button 
                  onClick={() => toggleAssinatura(selectedUser)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
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