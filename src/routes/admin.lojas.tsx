import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Store,
  MapPin,
  Phone,
  Calendar,
  X,
  User,
  ExternalLink,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/lojas")({
  component: AdminLojas,
});

function AdminLojas() {
  const [lojas, setLojas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoja, setSelectedLoja] = useState<any>(null);
  const [selectedLojaProducts, setSelectedLojaProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchLojas = async () => {
    setLoading(true);
    let query = supabase.from("lojas").select(`
      *,
      usuario:usuarios(nome, email)
    `);

    if (searchTerm) {
      query = query.ilike("nome", `%${searchTerm}%`);
    }

    const { data, error } = await query.order("criado_em", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar lojas");
    } else {
      setLojas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLojas();
  }, [searchTerm]);

  const approveLoja = async (loja: any) => {
    const { error } = await supabase
      .from("lojas")
      .update({ aprovada: true, ativo: true })
      .eq("id", loja.id);

    if (error) {
      toast.error("Erro ao aprovar loja");
    } else {
      toast.success("Loja aprovada com sucesso");
      fetchLojas();
    }
  };

  const suspendLoja = async (loja: any) => {
    const { error } = await supabase
      .from("lojas")
      .update({ ativo: false })
      .eq("id", loja.id);

    if (error) {
      toast.error("Erro ao suspender loja");
    } else {
      toast.success("Loja suspensa com sucesso");
      fetchLojas();
    }
  };

  const fetchProducts = async (lojaId: string) => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("loja_id", lojaId);
    
    if (!error) setSelectedLojaProducts(data || []);
    setLoadingProducts(false);
  };

  const openLojaDetails = (loja: any) => {
    setSelectedLoja(loja);
    fetchProducts(loja.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-space uppercase tracking-tight">Gestão de Lojas</h2>
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest mt-1">Gerencie parceiros comerciais e marketplace</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-2xl shadow-xl">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por nome da loja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0F] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Loja</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Proprietário</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Plano</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted animate-pulse">Carregando lojas...</td>
                </tr>
              ) : lojas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">Nenhuma loja encontrada</td>
                </tr>
              ) : (
                lojas.map((loja) => (
                  <tr key={loja.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center">
                          {loja.logo_url ? (
                            <img src={loja.logo_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Store size={20} className="text-text-muted" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{loja.nome}</p>
                          <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">{loja.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-text-secondary">{loja.usuario?.nome}</p>
                      <p className="text-[10px] text-text-muted mt-1">{loja.usuario?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        loja.plano === "prime" ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-text-muted border-white/10"
                      )}>
                        {loja.plano || 'FREE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          loja.aprovada ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
                        )}>
                          {loja.aprovada ? "Aprovada" : "Pendente"}
                        </span>
                        {!loja.ativo && (
                          <span className="w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-danger/10 text-danger border border-danger/20">
                            Suspensa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openLojaDetails(loja)}
                          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted hover:text-white"
                          title="Ver Detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        {!loja.aprovada && (
                          <button 
                            onClick={() => approveLoja(loja)}
                            className="p-2 hover:bg-success/10 rounded-xl transition-colors text-success"
                            title="Aprovar Loja"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        {loja.ativo && (
                          <button 
                            onClick={() => suspendLoja(loja)}
                            className="p-2 hover:bg-danger/10 rounded-xl transition-colors text-danger"
                            title="Suspender Loja"
                          >
                            <AlertTriangle size={16} />
                          </button>
                        )}
                        {!loja.ativo && (
                          <button 
                            onClick={() => approveLoja(loja)}
                            className="p-2 hover:bg-success/10 rounded-xl transition-colors text-success"
                            title="Ativar Loja"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loja Details Modal */}
      {selectedLoja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="relative h-40">
              {selectedLoja.banner_url ? (
                <img src={selectedLoja.banner_url} className="w-full h-full object-cover opacity-50" alt="" />
              ) : (
                <div className="w-full h-full bg-gradient-hero opacity-30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
              <button 
                onClick={() => setSelectedLoja(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-8 flex items-end gap-6">
                <div className="size-24 rounded-2xl bg-white/5 border-4 border-[#0A0A0F] shadow-xl overflow-hidden flex items-center justify-center bg-white">
                  {selectedLoja.logo_url ? (
                    <img src={selectedLoja.logo_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Store size={40} className="text-gray-300" />
                  )}
                </div>
                <div className="mb-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">{selectedLoja.nome}</h3>
                  <div className="flex items-center gap-2 text-text-muted">
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedLoja.categoria}</span>
                    <span className="size-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedLoja.plano || 'FREE'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic mb-4">Informações de Contato</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-primary" />
                        <div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Dono</p>
                          <p className="text-sm font-bold">{selectedLoja.usuario?.nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-primary" />
                        <div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Telefone</p>
                          <p className="text-sm font-bold">{selectedLoja.telefone || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-primary" />
                        <div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Endereço</p>
                          <p className="text-sm font-bold leading-tight">{selectedLoja.endereco || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-primary" />
                        <div>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Cadastro</p>
                          <p className="text-sm font-bold">{format(new Date(selectedLoja.criado_em), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic mb-4">Descrição</h4>
                    <p className="text-sm text-text-secondary leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                      {selectedLoja.descricao || 'Sem descrição.'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Produtos ({selectedLojaProducts.length})</h4>
                    <Package size={16} className="text-text-muted" />
                  </div>
                  <div className="space-y-3">
                    {loadingProducts ? (
                      <div className="text-center py-8 text-text-muted animate-pulse">Carregando produtos...</div>
                    ) : selectedLojaProducts.length === 0 ? (
                      <div className="text-center py-8 text-text-muted bg-white/5 rounded-2xl border border-dashed border-white/10 text-xs italic">Nenhum produto cadastrado</div>
                    ) : (
                      selectedLojaProducts.map(product => (
                        <div key={product.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                          <div className="size-10 rounded-lg bg-black/20 overflow-hidden flex-shrink-0">
                            {product.foto_url && <img src={product.foto_url} className="w-full h-full object-cover" alt="" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{product.nome}</p>
                            <p className="text-[10px] text-primary font-black uppercase">R$ {product.preco.toFixed(2)}</p>
                          </div>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                            product.ativo ? "text-success border-success/20" : "text-danger border-danger/20"
                          )}>
                            {product.ativo ? 'Ativo' : 'Off'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
              {!selectedLoja.aprovada ? (
                <button 
                  onClick={() => approveLoja(selectedLoja)}
                  className="flex-1 bg-success hover:bg-success/90 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Aprovar Loja
                </button>
              ) : selectedLoja.ativo ? (
                <button 
                  onClick={() => suspendLoja(selectedLoja)}
                  className="flex-1 bg-danger/10 text-danger hover:bg-danger/20 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Suspender Loja
                </button>
              ) : (
                <button 
                  onClick={() => approveLoja(selectedLoja)}
                  className="flex-1 bg-success/10 text-success hover:bg-success/20 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Reativar Loja
                </button>
              )}
              <button 
                onClick={() => window.open(`/loja/${selectedLoja.id}`, '_blank')}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
              >
                Ver na Loja <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}