import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Phone, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Star, 
  X,
  PhoneCall,
  MapPin,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/telefones")({
  component: AdminTelefones,
});

function AdminTelefones() {
  const [telefones, setTelefones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTelefone, setEditingTelefone] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    categoria: "Serviços Públicos",
    cidade: "São Paulo",
    destaque: false,
    ordem: 0
  });

  const fetchTelefones = async () => {
    setLoading(true);
    let query = supabase.from("telefones_uteis").select("*");

    if (searchTerm) {
      query = query.ilike("nome", `%${searchTerm}%`);
    }

    const { data, error } = await query.order("destaque", { ascending: false }).order("ordem", { ascending: true });

    if (!error) setTelefones(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTelefones();
  }, [searchTerm]);

  const saveTelefone = async () => {
    if (!formData.nome || !formData.telefone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    if (editingTelefone) {
      const { error } = await supabase.from("telefones_uteis").update(formData).eq("id", editingTelefone.id);
      if (!error) {
        toast.success("Telefone atualizado");
        setShowModal(false);
        fetchTelefones();
      }
    } else {
      const { error } = await supabase.from("telefones_uteis").insert(formData);
      if (!error) {
        toast.success("Telefone adicionado");
        setShowModal(false);
        fetchTelefones();
      }
    }
  };

  const deleteTelefone = async (id: string) => {
    if (!confirm("Excluir este telefone?")) return;
    const { error } = await supabase.from("telefones_uteis").delete().eq("id", id);
    if (!error) {
      toast.success("Excluído com sucesso");
      fetchTelefones();
    }
  };

  const openEdit = (tel: any) => {
    setEditingTelefone(tel);
    setFormData({
      nome: tel.nome,
      telefone: tel.telefone,
      categoria: tel.categoria,
      cidade: tel.cidade,
      destaque: tel.destaque,
      ordem: tel.ordem
    });
    setShowModal(true);
  };

  const toggleDestaque = async (tel: any) => {
    const { error } = await supabase.from("telefones_uteis").update({ destaque: !tel.destaque }).eq("id", tel.id);
    if (!error) fetchTelefones();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-inter uppercase tracking-tight">Telefones Úteis</h2>
          <p className="text-admin-text-secondary text-sm font-semibold mt-1">Gestão de contatos de emergência e serviços</p>
        </div>
        <button 
          onClick={() => {
            setEditingTelefone(null);
            setFormData({
              nome: "",
              telefone: "",
              categoria: "Serviços Públicos",
              cidade: "São Paulo",
              destaque: false,
              ordem: 0
            });
            setShowModal(true);
          }}
          className="bg-primary hover:bg-admin-primary/90 text-admin-text h-9 px-4 rounded-lg text-xs font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} /> Novo Telefone
        </button>
      </div>

      <div className="bg-admin-surface border border-admin-border-light p-4 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-admin-primary/50"
          />
        </div>
      </div>

      <div className="bg-admin-surface border border-admin-border-light rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-admin-hover">
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Contato / Nome</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Telefone</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-light">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-admin-text-secondary animate-pulse">Carregando...</td></tr>
              ) : (
                telefones.map(tel => (
                  <tr key={tel.id} className="hover:bg-admin-hover transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <button onClick={() => toggleDestaque(tel)} className={cn("transition-colors", tel.destaque ? "text-admin-warning" : "text-admin-text-secondary hover:text-admin-text")}>
                            <Star size={16} fill={tel.destaque ? "currentColor" : "none"} />
                          </button>
                          <div>
                             <p className="text-sm font-bold leading-none">{tel.nome}</p>
                             <p className="text-[10px] text-admin-text-secondary mt-1 ">{tel.cidade}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-admin-border-light text-admin-text-secondary border border-admin-border-light">
                          {tel.categoria}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-admin-primary">
                          <PhoneCall size={14} />
                          <span className="text-sm font-semibold ">{tel.telefone}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(tel)} className="p-2 hover:bg-admin-border-light rounded-lg transition-colors text-admin-text-secondary hover:text-admin-text">
                             <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteTelefone(tel.id)} className="p-2 hover:bg-admin-danger/10 rounded-lg transition-colors text-admin-danger">
                             <Trash2 size={16} />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-admin-surface border border-admin-border-light w-full max-w-lg rounded-lg overflow-hidden shadow-lg animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-admin-border-light flex items-center justify-between">
                 <h3 className="text-lg font-semibold  uppercase tracking-tighter">{editingTelefone ? 'Editar Contato' : 'Novo Contato'}</h3>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-admin-border-light rounded-full"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Nome do Serviço / Órgão</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Polícia Militar, UBS Central..."
                        value={formData.nome}
                        onChange={e => setFormData({...formData, nome: e.target.value})}
                        className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Número de Telefone</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 190, (11) 99999-9999"
                        value={formData.telefone}
                        onChange={e => setFormData({...formData, telefone: e.target.value})}
                        className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Categoria</label>
                          <select 
                            value={formData.categoria}
                            onChange={e => setFormData({...formData, categoria: e.target.value})}
                            className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                          >
                             <option value="Emergência">Emergência</option>
                             <option value="Serviços Públicos">Serviços Públicos</option>
                             <option value="Saúde">Saúde</option>
                             <option value="Utilidades">Utilidades</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Cidade</label>
                          <input 
                            type="text" 
                            value={formData.cidade}
                            onChange={e => setFormData({...formData, cidade: e.target.value})}
                            className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                          />
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <input 
                        type="checkbox" 
                        id="destaque"
                        checked={formData.destaque}
                        onChange={e => setFormData({...formData, destaque: e.target.checked})}
                        className="size-4 bg-admin-border-light border border-admin-border-light rounded"
                      />
                      <label htmlFor="destaque" className="text-xs font-bold text-admin-text-secondary cursor-pointer">Destacar este contato (topo da lista)</label>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-admin-hover border-t border-admin-border-light flex gap-3">
                 <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-admin-border-light hover:bg-admin-border-light rounded-lg text-xs font-semibold transition-all">Cancelar</button>
                 <button onClick={saveTelefone} className="flex-1 py-3 bg-primary hover:bg-admin-primary/90 text-admin-text rounded-lg text-xs font-semibold transition-all shadow-lg shadow-primary/20">Salvar Contato</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}