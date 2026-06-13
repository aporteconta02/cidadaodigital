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
          <h2 className="text-2xl font-bold font-inter uppercase tracking-tight">Gestão de Lojas</h2>
          <p className="text-admin-text-secondary text-sm font-semibold mt-1">Gerencie parceiros comerciais e marketplace</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-admin-surface border border-admin-border-light p-4 rounded-lg shadow-sm">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary" />
          <input 
            type="text" 
            placeholder="Buscar por nome da loja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-admin-border-light border border-admin-border-light rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-admin-primary/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-admin-surface border border-admin-border-light rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-admin-hover">
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Loja</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Proprietário</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Plano</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary">Status</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-admin-text-secondary text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-light">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-text-secondary animate-pulse">Carregando lojas...</td>
                </tr>
              ) : lojas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-admin-text-secondary">Nenhuma loja encontrada</td>
                </tr>
              ) : (
                lojas.map((loja) => (
                  <tr key={loja.id} className="hover:bg-admin-hover transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-admin-border-light border border-admin-border-light overflow-hidden flex items-center justify-center">
                          {loja.logo_url ? (
                            <img src={loja.logo_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Store size={20} className="text-admin-text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{loja.nome}</p>
                          <p className="text-[10px] text-admin-text-secondary mt-1 ">{loja.categoria}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-admin-text-secondary">{loja.usuario?.nome}</p>
                      <p className="text-[10px] text-admin-text-secondary mt-1">{loja.usuario?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                        loja.plano === "prime" ? "bg-admin-primary/10 text-admin-primary border-admin-primary/20" : "bg-admin-border-light text-admin-text-secondary border-admin-border-light"
                      )}>
                        {loja.plano || 'FREE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "w-fit px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                          loja.aprovada ? "bg-admin-success/10 text-admin-success border-admin-success/20" : "bg-admin-warning/10 text-admin-warning border-admin-warning/20"
                        )}>
                          {loja.aprovada ? "Aprovada" : "Pendente"}
                        </span>
                        {!loja.ativo && (
                          <span className="w-fit px-2 py-0.5 rounded-full text-[9px] font-semibold bg-admin-danger/10 text-admin-danger border border-admin-danger/20">
                            Suspensa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openLojaDetails(loja)}
                          className="p-2 hover:bg-admin-border-light rounded-lg transition-colors text-admin-text-secondary hover:text-admin-text"
                          title="Ver Detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        {!loja.aprovada && (
                          <button 
                            onClick={() => approveLoja(loja)}
                            className="p-2 hover:bg-admin-success/10 rounded-lg transition-colors text-admin-success"
                            title="Aprovar Loja"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        {loja.ativo && (
                          <button 
                            onClick={() => suspendLoja(loja)}
                            className="p-2 hover:bg-admin-danger/10 rounded-lg transition-colors text-admin-danger"
                            title="Suspender Loja"
                          >
                            <AlertTriangle size={16} />
                          </button>
                        )}
                        {!loja.ativo && (
                          <button 
                            onClick={() => approveLoja(loja)}
                            className="p-2 hover:bg-admin-success/10 rounded-lg transition-colors text-admin-success"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-admin-surface border border-admin-border-light w-full max-w-2xl rounded-lg overflow-hidden shadow-lg animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="relative h-40">
              {selectedLoja.banner_url ? (
                <img src={selectedLoja.banner_url} className="w-full h-full object-cover opacity-50" alt="" />
              ) : (
                <div className="w-full h-full bg-admin-primary opacity-30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent" />
              <button 
                onClick={() => setSelectedLoja(null)}
                className="absolute top-4 right-4 p-2 bg-admin-text/20 hover:bg-admin-text/30 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-8 flex items-end gap-6">
                <div className="size-24 rounded-lg bg-admin-border-light border-4 border-admin-surface shadow-sm overflow-hidden flex items-center justify-center bg-white">
                  {selectedLoja.logo_url ? (
                    <img src={selectedLoja.logo_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Store size={40} className="text-admin-text-muted" />
                  )}
                </div>
                <div className="mb-2">
                  <h3 className="text-2xl font-semibold  uppercase tracking-tighter">{selectedLoja.nome}</h3>
                  <div className="flex items-center gap-2 text-admin-text-secondary">
                    <span className="text-[10px] font-semibold">{selectedLoja.categoria}</span>
                    <span className="size-1 rounded-full bg-admin-border" />
                    <span className="text-[10px] font-semibold">{selectedLoja.plano || 'FREE'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-4">Informações de Contato</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Dono</p>
                          <p className="text-sm font-bold">{selectedLoja.usuario?.nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Telefone</p>
                          <p className="text-sm font-bold">{selectedLoja.telefone || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Endereço</p>
                          <p className="text-sm font-bold leading-tight">{selectedLoja.endereco || 'Não informado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-admin-primary" />
                        <div>
                          <p className="text-[10px] text-admin-text-secondary font-semibold">Cadastro</p>
                          <p className="text-sm font-bold">{format(new Date(selectedLoja.criado_em), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-4">Descrição</h4>
                    <p className="text-sm text-admin-text-secondary leading-relaxed bg-admin-border-light p-4 rounded-lg border border-admin-border-light">
                      {selectedLoja.descricao || 'Sem descrição.'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary ">Produtos ({selectedLojaProducts.length})</h4>
                    <Package size={16} className="text-admin-text-secondary" />
                  </div>
                  <div className="space-y-3">
                    {loadingProducts ? (
                      <div className="text-center py-8 text-admin-text-secondary animate-pulse">Carregando produtos...</div>
                    ) : selectedLojaProducts.length === 0 ? (
                      <div className="text-center py-8 text-admin-text-secondary bg-admin-border-light rounded-lg border border-dashed border-admin-border-light text-xs ">Nenhum produto cadastrado</div>
                    ) : (
                      selectedLojaProducts.map(product => (
                        <div key={product.id} className="flex items-center gap-3 bg-admin-border-light p-3 rounded-lg border border-admin-border-light hover:border-admin-border-light transition-colors group">
                          <div className="size-10 rounded-lg bg-admin-text/20 overflow-hidden flex-shrink-0">
                            {product.foto_url && <img src={product.foto_url} className="w-full h-full object-cover" alt="" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{product.nome}</p>
                            <p className="text-[10px] text-admin-primary font-semibold uppercase">R$ {product.preco.toFixed(2)}</p>
                          </div>
                          <span className={cn(
                            "text-[8px] font-semibold px-1.5 py-0.5 rounded border",
                            product.ativo ? "text-admin-success border-admin-success/20" : "text-admin-danger border-admin-danger/20"
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

            <div className="p-6 bg-admin-hover border-t border-admin-border-light flex gap-3">
              {!selectedLoja.aprovada ? (
                <button 
                  onClick={() => approveLoja(selectedLoja)}
                  className="flex-1 bg-success hover:bg-admin-success/90 text-admin-text py-3 rounded-lg text-xs font-semibold transition-all"
                >
                  Aprovar Loja
                </button>
              ) : selectedLoja.ativo ? (
                <button 
                  onClick={() => suspendLoja(selectedLoja)}
                  className="flex-1 bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20 py-3 rounded-lg text-xs font-semibold transition-all"
                >
                  Suspender Loja
                </button>
              ) : (
                <button 
                  onClick={() => approveLoja(selectedLoja)}
                  className="flex-1 bg-admin-success/10 text-admin-success hover:bg-admin-success/20 py-3 rounded-lg text-xs font-semibold transition-all"
                >
                  Reativar Loja
                </button>
              )}
              <button 
                onClick={() => window.open(`/loja/${selectedLoja.id}`, '_blank')}
                className="px-6 py-3 bg-admin-border-light hover:bg-admin-border-light text-admin-text rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
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