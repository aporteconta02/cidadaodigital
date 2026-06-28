import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Plus, Edit, Image as ImageIcon, Package, Store as StoreIcon, ClipboardList, BarChart3, X, Ticket, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatBRL, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/minha-loja")({
  component: MinhaLojaPage,
});

const STATUS_FLOW: Record<string, string[]> = {
  pendente: ['confirmado', 'cancelado'],
  confirmado: ['preparando', 'cancelado'],
  preparando: ['saiu', 'cancelado'],
  saiu: ['entregue'],
  entregue: [],
  cancelado: [],
};

const STATUS_COLOR: Record<string, string> = {
  pendente: "bg-yellow-500/10 text-yellow-500",
  confirmado: "bg-blue-500/10 text-blue-500",
  preparando: "bg-orange-500/10 text-orange-500",
  saiu: "bg-purple-500/10 text-purple-500",
  entregue: "bg-success/10 text-success",
  cancelado: "bg-danger/10 text-danger",
};

function MinhaLojaPage() {
  const { usuario } = useAuth();
  const [loja, setLoja] = useState<any>(null);
  const [tab, setTab] = useState<'resumo' | 'produtos' | 'pedidos' | 'cupons'>('resumo');
  const [produtos, setProdutos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cupons, setCupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [editingProduto, setEditingProduto] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', descricao: '', preco: '', categoria: 'alimento', foto_url: '', estoque: '0' });
  const [uploading, setUploading] = useState(false);

  // Cupom form
  const [showCupomForm, setShowCupomForm] = useState(false);
  const [editingCupom, setEditingCupom] = useState<any | null>(null);
  const [cupomData, setCupomData] = useState({
    codigo: '', descricao: '', tipo_desconto: 'percentual' as 'percentual' | 'valor_fixo',
    valor_desconto: '', valor_minimo_pedido: '0', limite_uso: '', validade: '',
  });

  useEffect(() => {
    if (!usuario) return;
    supabase.from('lojas').select('*').eq('usuario_id', usuario.id).maybeSingle()
      .then(({ data }) => { setLoja(data); setLoading(false); });
  }, [usuario]);

  useEffect(() => {
    if (!loja) return;
    supabase.from('produtos').select('*').eq('loja_id', loja.id).order('criado_em', { ascending: false })
      .then(({ data }) => setProdutos(data || []));
    supabase.from('pedidos').select('*, usuarios(nome, telefone), cupons(codigo)').eq('loja_id', loja.id).order('criado_em', { ascending: false })
      .then(({ data }) => setPedidos(data || []));
    supabase.from('cupons').select('*').eq('loja_id', loja.id).order('created_at', { ascending: false })
      .then(({ data }) => setCupons(data || []));

    // Realtime subscription
    const channel = supabase.channel(`pedidos-loja-${loja.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos', filter: `loja_id=eq.${loja.id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase.from('pedidos').select('*, usuarios(nome, telefone)').eq('id', (payload.new as any).id).maybeSingle();
            if (data) {
              setPedidos(curr => [data, ...curr]);
              toast.success("🔔 Novo pedido!");
            }
          } else if (payload.eventType === 'UPDATE') {
            setPedidos(curr => curr.map(p => p.id === (payload.new as any).id ? { ...p, ...payload.new } : p));
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loja]);

  const openNew = () => {
    setEditingProduto(null);
    setFormData({ nome: '', descricao: '', preco: '', categoria: 'alimento', foto_url: '', estoque: '0' });
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditingProduto(p);
    setFormData({ nome: p.nome, descricao: p.descricao || '', preco: String(p.preco), categoria: p.categoria || 'alimento', foto_url: p.foto_url || '', estoque: String(p.estoque || 0) });
    setShowForm(true);
  };

  const uploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !loja) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${loja.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('fotos-produtos').upload(path, file);
      if (error) throw error;
      const { data: signed, error: signErr } = await supabase.storage
        .from('fotos-produtos')
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr || !signed) throw signErr || new Error("Falha ao gerar URL");
      setFormData(f => ({ ...f, foto_url: signed.signedUrl }));
      toast.success("Foto enviada!");
    } catch (err: any) {
      toast.error(err.message || "Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const salvarProduto = async () => {
    if (!loja || !formData.nome.trim() || !formData.preco) return toast.error("Preencha nome e preço");
    const payload = {
      loja_id: loja.id,
      nome: formData.nome.trim(),
      descricao: formData.descricao,
      preco: parseFloat(formData.preco.replace(',', '.')),
      categoria: formData.categoria,
      foto_url: formData.foto_url || null,
      estoque: parseInt(formData.estoque) || 0,
    };
    try {
      if (editingProduto) {
        const { error } = await supabase.from('produtos').update(payload).eq('id', editingProduto.id);
        if (error) throw error;
        setProdutos(curr => curr.map(p => p.id === editingProduto.id ? { ...p, ...payload } : p));
        toast.success("Produto atualizado!");
      } else {
        const { data, error } = await supabase.from('produtos').insert({ ...payload, ativo: true }).select().single();
        if (error) throw error;
        setProdutos(curr => [data, ...curr]);
        toast.success("Produto criado!");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleAtivo = async (p: any) => {
    const { error } = await supabase.from('produtos').update({ ativo: !p.ativo }).eq('id', p.id);
    if (error) return toast.error(error.message);
    setProdutos(curr => curr.map(x => x.id === p.id ? { ...x, ativo: !p.ativo } : x));
  };

  const mudarStatus = async (pedido: any, novo: string) => {
    if (!window.confirm(`Mudar status para "${novo}"?`)) return;
    const { error } = await supabase.from('pedidos').update({ status: novo }).eq('id', pedido.id);
    if (error) return toast.error(error.message);
    setPedidos(curr => curr.map(p => p.id === pedido.id ? { ...p, status: novo } : p));
    toast.success("Status atualizado");
  };

  // ===== Cupons =====
  const openCupomNew = () => {
    setEditingCupom(null);
    setCupomData({ codigo: '', descricao: '', tipo_desconto: 'percentual', valor_desconto: '', valor_minimo_pedido: '0', limite_uso: '', validade: '' });
    setShowCupomForm(true);
  };

  const openCupomEdit = (c: any) => {
    setEditingCupom(c);
    setCupomData({
      codigo: c.codigo,
      descricao: c.descricao || '',
      tipo_desconto: c.tipo_desconto,
      valor_desconto: String(c.valor_desconto),
      valor_minimo_pedido: String(c.valor_minimo_pedido || 0),
      limite_uso: c.limite_uso ? String(c.limite_uso) : '',
      validade: c.validade ? c.validade.slice(0, 10) : '',
    });
    setShowCupomForm(true);
  };

  const salvarCupom = async () => {
    if (!loja) return;
    const codigo = cupomData.codigo.trim().toUpperCase();
    const valor = parseFloat(cupomData.valor_desconto.replace(',', '.'));
    if (!codigo) return toast.error('Informe o código');
    if (isNaN(valor) || valor <= 0) return toast.error('Valor de desconto inválido');
    if (cupomData.tipo_desconto === 'percentual' && valor > 100) return toast.error('Percentual máximo 100%');

    const payload: any = {
      loja_id: loja.id,
      codigo,
      descricao: cupomData.descricao || null,
      tipo_desconto: cupomData.tipo_desconto,
      valor_desconto: valor,
      valor_minimo_pedido: parseFloat(cupomData.valor_minimo_pedido.replace(',', '.')) || 0,
      limite_uso: cupomData.limite_uso ? parseInt(cupomData.limite_uso, 10) : null,
      validade: cupomData.validade ? new Date(cupomData.validade).toISOString() : null,
    };

    if (editingCupom) {
      const { error } = await supabase.from('cupons').update(payload).eq('id', editingCupom.id);
      if (error) return toast.error(error.message);
      setCupons(curr => curr.map(c => c.id === editingCupom.id ? { ...c, ...payload } : c));
      toast.success('Cupom atualizado');
    } else {
      const { data, error } = await supabase.from('cupons').insert(payload).select().single();
      if (error) return toast.error(error.message);
      setCupons(curr => [data, ...curr]);
      toast.success('Cupom criado');
    }
    setShowCupomForm(false);
  };

  const toggleCupomAtivo = async (c: any) => {
    const { error } = await supabase.from('cupons').update({ ativo: !c.ativo }).eq('id', c.id);
    if (error) return toast.error(error.message);
    setCupons(curr => curr.map(x => x.id === c.id ? { ...x, ativo: !c.ativo } : x));
  };

  const excluirCupom = async (c: any) => {
    if (!window.confirm(`Excluir cupom ${c.codigo}?`)) return;
    const { error } = await supabase.from('cupons').delete().eq('id', c.id);
    if (error) return toast.error(error.message);
    setCupons(curr => curr.filter(x => x.id !== c.id));
    toast.success('Cupom excluído');
  };



  if (loading) return <div className="p-10 text-center text-text-muted">Carregando...</div>;
  if (usuario?.tipo !== 'comerciante') {
    return (
      <div className="p-10 text-center text-text-muted">
        <StoreIcon size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-sm">Apenas comerciantes têm acesso a esta área.</p>
        <Link to="/perfil" className="inline-block mt-4 px-4 h-9 leading-9 rounded-lg bg-primary text-white text-sm font-bold">Voltar ao perfil</Link>
      </div>
    );
  }
  if (!loja) {
    return (
      <div className="p-10 text-center text-text-muted">
        <StoreIcon size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-sm">Você ainda não possui uma loja cadastrada.</p>
        <Link to="/perfil" className="inline-block mt-4 px-4 h-9 leading-9 rounded-lg bg-primary text-white text-sm font-bold">Voltar ao perfil</Link>
      </div>
    );
  }

  const totalVendas = pedidos.filter(p => p.status === 'entregue').reduce((s, p) => s + Number(p.total), 0);
  const pedidosPendentes = pedidos.filter(p => ['pendente', 'confirmado', 'preparando'].includes(p.status)).length;

  return (
    <div className="min-h-screen bg-bg-primary pb-8 px-4 pt-6">
      <Link to="/perfil" className="inline-flex items-center gap-2 text-text-muted mb-4"><ChevronLeft size={18} /> Voltar</Link>
      <h1 className="text-2xl font-black mb-1">{loja.nome}</h1>
      <p className="text-xs text-text-muted uppercase font-bold mb-6">{loja.categoria} · {loja.aprovada ? '✅ Aprovada' : '⏳ Aguardando aprovação'}</p>

      <div className="flex gap-2 border-b border-white/5 mb-6">
        {([['resumo', BarChart3], ['produtos', Package], ['pedidos', ClipboardList]] as const).map(([t, Icon]) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2",
              tab === t ? "border-primary text-primary" : "border-transparent text-text-muted")}>
            <Icon size={14} /> {t}
          </button>
        ))}
      </div>

      {tab === 'resumo' && (
        <div className="grid grid-cols-2 gap-3">
          <Card label="Vendas (entregues)" value={formatBRL(totalVendas)} />
          <Card label="Pedidos pendentes" value={String(pedidosPendentes)} />
          <Card label="Produtos ativos" value={String(produtos.filter(p => p.ativo).length)} />
          <Card label="Total de pedidos" value={String(pedidos.length)} />
        </div>
      )}

      {tab === 'produtos' && (
        <div>
          <button onClick={openNew} className="w-full mb-4 h-9 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2">
            <Plus size={16} /> Novo produto
          </button>
          {produtos.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-10">Nenhum produto ainda</p>
          ) : (
            <div className="space-y-2">
              {produtos.map(p => (
                <div key={p.id} className={cn("flex items-center gap-3 p-3 bg-bg-card border border-white/5 rounded-lg", !p.ativo && "opacity-50")}>
                  <div className="size-12 rounded-md bg-white/5 overflow-hidden flex-shrink-0">
                    {p.foto_url && <img src={p.foto_url} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{p.nome}</div>
                    <div className="text-xs text-primary font-bold">{formatBRL(p.preco)}</div>
                  </div>
                  <button onClick={() => toggleAtivo(p)} className={cn("text-[9px] font-bold uppercase px-2 py-1 rounded", p.ativo ? "bg-success/10 text-success" : "bg-white/5 text-text-muted")}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                  <button onClick={() => openEdit(p)} className="size-8 rounded-md bg-white/5 flex items-center justify-center"><Edit size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'pedidos' && (
        <div className="space-y-3">
          {pedidos.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-10">Nenhum pedido recebido ainda</p>
          ) : pedidos.map(p => (
            <div key={p.id} className="p-4 bg-bg-card border border-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-mono text-text-muted">#{p.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-sm font-bold">{p.usuarios?.nome || 'Cliente'}</div>
                  <div className="text-[10px] text-text-muted">{format(new Date(p.criado_em), 'dd/MM HH:mm', { locale: ptBR })} · {p.tipo_entrega}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-primary">{formatBRL(p.total)}</div>
                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", STATUS_COLOR[p.status])}>{p.status}</span>
                </div>
              </div>
              <Link to="/pedidos/$pedidoId" params={{ pedidoId: p.id }} className="text-[10px] text-primary uppercase font-bold">Ver detalhes →</Link>
              {STATUS_FLOW[p.status]?.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {STATUS_FLOW[p.status].map(s => (
                    <button key={s} onClick={() => mudarStatus(p, s)}
                      className={cn("h-8 px-3 rounded-lg text-[11px] font-bold uppercase",
                        s === 'cancelado' ? "bg-danger/10 text-danger" : "bg-primary text-white")}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-bg-elevated border-border-custom max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduto ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-text-muted block mb-1">Foto</label>
              <label className="flex items-center justify-center h-32 bg-white/5 rounded-lg border border-dashed border-white/10 cursor-pointer overflow-hidden">
                {formData.foto_url
                  ? <img src={formData.foto_url} className="w-full h-full object-cover" />
                  : <div className="text-text-muted text-xs flex flex-col items-center gap-1"><ImageIcon size={24} /><span>{uploading ? 'Enviando...' : 'Toque para enviar'}</span></div>}
                <input type="file" accept="image/*" className="hidden" onChange={uploadFoto} />
              </label>
            </div>
            <input placeholder="Nome" value={formData.nome} onChange={e => setFormData(f => ({ ...f, nome: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm" />
            <textarea placeholder="Descrição" value={formData.descricao} onChange={e => setFormData(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm" rows={2} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Preço (0.00)" value={formData.preco} onChange={e => setFormData(f => ({ ...f, preco: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm" />
              <input placeholder="Estoque" type="number" value={formData.estoque} onChange={e => setFormData(f => ({ ...f, estoque: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm" />
            </div>
            <select value={formData.categoria} onChange={e => setFormData(f => ({ ...f, categoria: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
              <option value="alimento">Comida</option>
              <option value="moda">Moda</option>
              <option value="farma">Farmácia</option>
              <option value="mercado">Mercado</option>
              <option value="pet">Pet</option>
              <option value="servico">Serviços</option>
              <option value="outro">Outros</option>
            </select>
            <button onClick={salvarProduto} className="w-full h-10 bg-primary text-white rounded-lg font-bold text-sm">
              {editingProduto ? 'Atualizar' : 'Criar produto'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-bg-card border border-white/5 rounded-lg">
      <div className="text-[10px] uppercase font-bold text-text-muted">{label}</div>
      <div className="text-xl font-black mt-1">{value}</div>
    </div>
  );
}
