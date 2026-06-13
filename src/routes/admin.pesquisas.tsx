import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Trash2, 
  X,
  PlusCircle,
  MapPin,
  List,
  ChevronRight,
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/pesquisas")({
  component: AdminPesquisas,
});

function AdminPesquisas() {
  const [pesquisas, setPesquisas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPesquisa, setSelectedPesquisa] = useState<any>(null);
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [neighborhoodData, setNeighborhoodData] = useState<any[]>([]);
  const [textResponses, setTextResponses] = useState<any[]>([]);

  // Form State
  const [newPesquisa, setNewPesquisa] = useState({
    titulo: "",
    descricao: "",
    categoria: "Geral",
    tipo: "unica",
    encerra_em: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    opcoes: ["", ""]
  });

  const fetchPesquisas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pesquisas")
      .select("*")
      .order("criado_em", { ascending: false });

    if (!error) setPesquisas(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPesquisas();
  }, []);

  const createPesquisa = async () => {
    if (!newPesquisa.titulo || newPesquisa.opcoes.some(o => !o && newPesquisa.tipo !== 'texto')) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const { error } = await supabase.from("pesquisas").insert({
      titulo: newPesquisa.titulo,
      descricao: newPesquisa.descricao,
      categoria: newPesquisa.categoria,
      tipo: newPesquisa.tipo,
      opcoes: newPesquisa.tipo === 'texto' ? null : newPesquisa.opcoes.filter(o => o.trim() !== ""),
      encerra_em: new Date(newPesquisa.encerra_em).toISOString(),
      ativa: true,
      cidade: "São Paulo" // Default
    });

    if (error) {
      toast.error("Erro ao criar pesquisa");
    } else {
      toast.success("Pesquisa publicada!");
      setShowCreateModal(false);
      fetchPesquisas();
      setNewPesquisa({
        titulo: "",
        descricao: "",
        categoria: "Geral",
        tipo: "unica",
        encerra_em: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        opcoes: ["", ""]
      });
    }
  };

  const fetchResults = async (pesquisa: any) => {
    setSelectedPesquisa(pesquisa);
    const { data: respostas, error } = await supabase
      .from("respostas_pesquisa")
      .select("*")
      .eq("pesquisa_id", pesquisa.id);

    if (error) return;

    if (pesquisa.tipo === 'texto') {
      setTextResponses(respostas || []);
    } else {
      const counts: Record<string, number> = {};
      const neighborhoodCounts: Record<string, number> = {};
      
      pesquisa.opcoes?.forEach((opt: string) => counts[opt] = 0);
      
      respostas?.forEach(r => {
        const respostaObj = r.resposta as any;
        const resp = respostaObj?.valor;
        if (Array.isArray(resp)) {
          resp.forEach((v: string) => counts[v] = (counts[v] || 0) + 1);
        } else if (resp) {
          counts[resp] = (counts[resp] || 0) + 1;
        }

        if (r.bairro) {
          neighborhoodCounts[r.bairro] = (neighborhoodCounts[r.bairro] || 0) + 1;
        }
      });

      const colors = ['#6C63FF', '#FF6B35', '#00D68F', '#FF3B5C', '#FFD700'];
      setResultsData(Object.entries(counts).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length]
      })));

      setNeighborhoodData(Object.entries(neighborhoodCounts).map(([bairro, total]) => ({
        bairro,
        total
      })).sort((a, b) => b.total - a.total));
    }
  };

  const endPesquisa = async (id: string) => {
    const { error } = await supabase.from("pesquisas").update({ ativa: false }).eq("id", id);
    if (!error) {
      toast.success("Pesquisa encerrada");
      fetchPesquisas();
      if (selectedPesquisa?.id === id) setSelectedPesquisa({ ...selectedPesquisa, ativa: false });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-inter uppercase tracking-tight">Voz do Povo</h2>
          <p className="text-admin-text-secondary text-sm font-semibold mt-1">Gestão de pesquisas e engajamento comunitário</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-admin-primary/90 text-admin-text px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} /> Nova Pesquisa
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full h-40 bg-admin-border-light rounded-xl animate-pulse" />
        ) : pesquisas.length === 0 ? (
          <div className="col-span-full py-12 text-center text-admin-text-secondary bg-admin-border-light rounded-xl border border-dashed border-admin-border-light ">Nenhuma pesquisa encontrada</div>
        ) : (
          pesquisas.map(p => (
            <div key={p.id} className="bg-admin-surface border border-admin-border-light rounded-xl p-6 shadow-sm hover-card-effect group relative overflow-hidden">
               {p.ativa ? (
                 <div className="absolute top-0 right-0 px-4 py-1.5 bg-admin-success/20 text-admin-success text-[8px] font-semibold rounded-bl-xl border-l border-b border-admin-success/20">Ativa</div>
               ) : (
                 <div className="absolute top-0 right-0 px-4 py-1.5 bg-admin-border-light text-admin-text-secondary text-[8px] font-semibold rounded-bl-xl border-l border-b border-admin-border-light">Encerrada</div>
               )}
               
               <div className="flex items-start gap-4">
                  <div className="size-12 rounded-lg bg-admin-border-light flex items-center justify-center text-admin-primary flex-shrink-0">
                    <MessageSquare size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold  uppercase tracking-tighter leading-tight mb-1">{p.titulo}</h3>
                    <p className="text-[10px] text-admin-text-secondary font-semibold">{p.categoria} • Finaliza em: {format(new Date(p.encerra_em), 'dd/MM/yy')}</p>
                    <div className="mt-6 flex items-center justify-between">
                       <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="size-6 rounded-full border-2 border-admin-surface bg-admin-border-light flex items-center justify-center text-[8px] font-semibold">?</div>
                          ))}
                          <div className="text-[10px] text-admin-text-secondary font-bold pl-4">Votos totais</div>
                       </div>
                       <button 
                        onClick={() => fetchResults(p)}
                        className="p-2 bg-admin-border-light hover:bg-admin-border-light rounded-xl transition-all group-hover:translate-x-1"
                       >
                         <ChevronRight size={18} className="text-admin-primary" />
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-admin-surface border border-admin-border-light w-full max-w-xl rounded-xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-admin-border-light flex items-center justify-between">
               <h3 className="text-lg font-semibold  uppercase tracking-tighter">Criar Nova Pesquisa</h3>
               <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-admin-border-light rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Título da Pesquisa</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Qual sua opinião sobre a nova praça?"
                      value={newPesquisa.titulo}
                      onChange={e => setNewPesquisa({...newPesquisa, titulo: e.target.value})}
                      className="w-full bg-admin-border-light border border-admin-border-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Descrição (opcional)</label>
                    <textarea 
                      placeholder="Mais detalhes sobre o objetivo da pesquisa..."
                      value={newPesquisa.descricao}
                      onChange={e => setNewPesquisa({...newPesquisa, descricao: e.target.value})}
                      className="w-full bg-admin-border-light border border-admin-border-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50 h-24 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Tipo de Resposta</label>
                        <select 
                          value={newPesquisa.tipo}
                          onChange={e => setNewPesquisa({...newPesquisa, tipo: e.target.value})}
                          className="w-full bg-admin-border-light border border-admin-border-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                        >
                          <option value="unica">Escolha Única</option>
                          <option value="multipla">Múltipla Escolha</option>
                          <option value="texto">Texto Livre</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Data de Encerramento</label>
                        <input 
                          type="date" 
                          value={newPesquisa.encerra_em}
                          onChange={e => setNewPesquisa({...newPesquisa, encerra_em: e.target.value})}
                          className="w-full bg-admin-border-light border border-admin-border-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                        />
                     </div>
                  </div>
               </div>

               {newPesquisa.tipo !== 'texto' && (
                 <div className="space-y-3">
                    <label className="text-[10px] font-semibold text-admin-text-secondary mb-2 block">Opções de Voto</label>
                    {newPesquisa.opcoes.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                         <input 
                          type="text" 
                          placeholder={`Opção ${i + 1}`}
                          value={opt}
                          onChange={e => {
                            const newOpts = [...newPesquisa.opcoes];
                            newOpts[i] = e.target.value;
                            setNewPesquisa({...newPesquisa, opcoes: newOpts});
                          }}
                          className="flex-1 bg-admin-border-light border border-admin-border-light rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-admin-primary/50"
                        />
                        {newPesquisa.opcoes.length > 2 && (
                          <button onClick={() => {
                            const newOpts = newPesquisa.opcoes.filter((_, idx) => idx !== i);
                            setNewPesquisa({...newPesquisa, opcoes: newOpts});
                          }} className="p-2 text-admin-danger"><Trash2 size={16} /></button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => setNewPesquisa({...newPesquisa, opcoes: [...newPesquisa.opcoes, ""]})}
                      className="text-[10px] font-semibold text-admin-primary flex items-center gap-1.5 py-2 hover:underline"
                    >
                      <PlusCircle size={14} /> Adicionar Opção
                    </button>
                 </div>
               )}
            </div>
            <div className="p-6 bg-admin-hover border-t border-admin-border-light flex gap-3">
               <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-admin-border-light hover:bg-admin-border-light rounded-lg text-xs font-semibold transition-all">Cancelar</button>
               <button onClick={createPesquisa} className="flex-1 py-3 bg-primary hover:bg-admin-primary/90 text-admin-text rounded-lg text-xs font-semibold transition-all shadow-lg shadow-primary/20">Publicar Pesquisa</button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {selectedPesquisa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-admin-text/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-admin-surface border border-admin-border-light w-full max-w-4xl rounded-xl overflow-hidden shadow-lg animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-admin-border-light flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-admin-primary/10 flex items-center justify-center text-admin-primary"><BarChart3 size={20} /></div>
                  <div>
                    <h3 className="text-lg font-semibold  uppercase tracking-tighter leading-tight">{selectedPesquisa.titulo}</h3>
                    <p className="text-[10px] text-admin-text-secondary font-semibold">Resultados Consolidados</p>
                  </div>
               </div>
               <button onClick={() => setSelectedPesquisa(null)} className="p-2 hover:bg-admin-border-light rounded-full"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
               {selectedPesquisa.tipo === 'texto' ? (
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  mb-6 flex items-center gap-2"><List size={14} /> Respostas de Texto Livre</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {textResponses.map((r, i) => (
                         <div key={i} className="bg-admin-border-light p-4 rounded-lg border border-admin-border-light">
                            <p className="text-sm text-admin-text-secondary leading-relaxed ">"{(r.resposta as any)?.valor}"</p>
                            <div className="mt-3 flex items-center justify-between border-t border-admin-border-light pt-2">
                               <p className="text-[9px] text-admin-text-secondary font-semibold">{r.bairro || 'Desconhecido'}</p>
                            </div>
                         </div>
                       ))}
                       {textResponses.length === 0 && <div className="col-span-full py-12 text-center text-admin-text-secondary ">Aguardando as primeiras respostas...</div>}
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  flex items-center gap-2"><PieChartIcon size={14} /> Distribuição de Votos</h4>
                        <div className="h-80 w-full bg-admin-border-light rounded-xl p-6 border border-admin-border-light">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resultsData} layout="vertical" margin={{ left: 40, right: 40 }}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} width={120} />
                              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#111118', border: '1px solid #2A2A3A', borderRadius: '12px' }} />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {resultsData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-text-secondary  flex items-center gap-2"><MapPin size={14} /> Votos por Bairro</h4>
                         <div className="bg-admin-border-light rounded-xl border border-admin-border-light overflow-hidden">
                            <table className="w-full text-left">
                               <thead>
                                  <tr className="bg-admin-border-light">
                                     <th className="px-4 py-3 text-[9px] font-semibold text-admin-text-secondary">Bairro</th>
                                     <th className="px-4 py-3 text-right text-[9px] font-semibold text-admin-text-secondary">Total</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-admin-border-light">
                                  {neighborhoodData.map((n, i) => (
                                    <tr key={i} className="text-xs">
                                       <td className="px-4 py-3 font-bold">{n.bairro}</td>
                                       <td className="px-4 py-3 text-right font-semibold text-admin-primary">{n.total}</td>
                                    </tr>
                                  ))}
                                  {neighborhoodData.length === 0 && (
                                    <tr><td colSpan={2} className="px-4 py-8 text-center text-admin-text-secondary  opacity-50">Sem dados de localização</td></tr>
                                  )}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </div>
                 </>
               )}
            </div>

            <div className="p-6 bg-admin-hover border-t border-admin-border-light flex gap-3">
               <button onClick={() => setSelectedPesquisa(null)} className="px-8 py-3 bg-admin-border-light hover:bg-admin-border-light rounded-lg text-xs font-semibold transition-all">Fechar</button>
               {selectedPesquisa.ativa && (
                 <button onClick={() => endPesquisa(selectedPesquisa.id)} className="px-8 py-3 bg-admin-danger/10 text-admin-danger hover:bg-admin-danger/20 rounded-lg text-xs font-semibold transition-all">Encerrar Pesquisa</button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}