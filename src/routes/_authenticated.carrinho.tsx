import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useState, useMemo } from "react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn, formatBRL } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/carrinho")({
  component: CarrinhoPage,
});

function CarrinhoPage() {
  const { itens, alterarQuantidade, removerItem, limparCarrinho, total } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [tipoEntrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada');
  const [endereco, setEndereco] = useState(usuario ? `${usuario.bairro || ''} - ${usuario.cidade || ''}` : '');
  const [observacao, setObservacao] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Group by loja (apenas itens com loja_id válida)
  const porLoja = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};
    for (const it of itens) {
      if (!it.loja_id) continue; // ignora itens sem loja (evita FK violation)
      (groups[it.loja_id] ||= []).push(it);
    }
    return groups;
  }, [itens]);

  const itensInvalidos = useMemo(() => itens.filter(it => !it.loja_id), [itens]);

  const finalizar = async () => {
    if (!usuario) return toast.error("Faça login primeiro");
    if (itens.length === 0) return toast.error("Carrinho vazio");
    if (itensInvalidos.length > 0) return toast.error("Há itens sem loja associada. Remova-os para continuar.");
    if (Object.keys(porLoja).length === 0) return toast.error("Nenhum item válido para finalizar");
    if (tipoEntrega === 'entrega' && !endereco.trim()) return toast.error("Informe o endereço de entrega");

    setSubmitting(true);
    try {
      const lojaIds = Object.keys(porLoja);
      // Cria 1 pedido por loja
      const pedidosCriados: any[] = [];
      for (const lojaId of lojaIds) {
        const itensLoja = porLoja[lojaId];
        const totalLoja = itensLoja.reduce((s, it) => s + it.produto.preco * it.quantidade, 0);
        const { data: pedido, error: pErr } = await supabase.from('pedidos').insert({
          comprador_id: usuario.id,
          loja_id: lojaId,
          status: 'pendente',
          tipo_entrega: tipoEntrega,
          total: totalLoja,
          endereco_entrega: tipoEntrega === 'entrega' ? endereco : null,
          observacao: observacao || null,
        }).select().single();
        if (pErr) throw pErr;

        const itensInsert = itensLoja.map(it => ({
          pedido_id: pedido.id,
          produto_id: it.produto.id,
          quantidade: it.quantidade,
          preco_unitario: it.produto.preco,
        }));
        const { error: iErr } = await supabase.from('itens_pedido').insert(itensInsert);
        if (iErr) throw iErr;
        pedidosCriados.push(pedido);
      }
      limparCarrinho();
      navigate({ to: `/pedido-confirmado/${pedidosCriados[0].id}` });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao finalizar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (itens.length === 0) {
    return (
      <div className="pb-32 min-h-screen bg-bg-primary px-4 pt-6">
        <Link to="/comercio" className="inline-flex items-center gap-2 text-text-muted mb-8"><ChevronLeft size={18} /> Voltar</Link>
        <div className="py-20 text-center opacity-50">
          <ShoppingCart size={56} className="mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Seu carrinho está vazio</p>
          <Link to="/comercio" className="inline-block mt-6 px-6 h-9 leading-9 rounded-lg bg-primary text-white text-sm font-bold">Explorar produtos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-40 min-h-screen bg-bg-primary">
      <div className="px-4 pt-6 mb-4 flex items-center justify-between">
        <Link to="/comercio" className="inline-flex items-center gap-2 text-text-muted"><ChevronLeft size={18} /> Voltar</Link>
        <button onClick={limparCarrinho} className="text-xs text-danger font-bold uppercase">Limpar</button>
      </div>

      <div className="px-4 space-y-4">
        {Object.entries(porLoja).map(([lojaId, items]) => (
          <div key={lojaId} className="bg-bg-card border border-white/5 rounded-lg p-3 space-y-3">
            {items.map(it => (
              <div key={it.produto.id} className="flex items-center gap-3">
                <div className="size-14 rounded-md bg-white/5 overflow-hidden flex-shrink-0">
                  {it.produto.imagem_url && <img src={it.produto.imagem_url} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{it.produto.nome}</div>
                  <div className="text-xs text-primary font-bold">{formatBRL(it.produto.preco)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => alterarQuantidade(it.produto.id, it.quantidade - 1)} className="size-7 rounded-md bg-white/5 flex items-center justify-center"><Minus size={14} /></button>
                  <span className="w-5 text-center text-sm font-bold">{it.quantidade}</span>
                  <button onClick={() => alterarQuantidade(it.produto.id, it.quantidade + 1)} className="size-7 rounded-md bg-white/5 flex items-center justify-center"><Plus size={14} /></button>
                </div>
                <button onClick={() => removerItem(it.produto.id)} className="text-danger size-7 flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="px-4 mt-6 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase text-text-muted mb-2 block">Tipo de Entrega</label>
          <div className="flex gap-2">
            {(['retirada', 'entrega'] as const).map(t => (
              <button key={t} onClick={() => setTipoEntrega(t)}
                className={cn("flex-1 h-10 rounded-lg text-xs font-bold uppercase border",
                  tipoEntrega === t ? "bg-primary text-white border-primary" : "bg-bg-card text-text-secondary border-white/5")}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {tipoEntrega === 'entrega' && (
          <div>
            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block">Endereço de Entrega</label>
            <input value={endereco} onChange={e => setEndereco(e.target.value)}
              className="w-full bg-bg-card border border-white/5 rounded-lg p-3 text-sm" placeholder="Rua, número, bairro" />
          </div>
        )}

        <div>
          <label className="text-[10px] font-black uppercase text-text-muted mb-2 block">Observação (opcional)</label>
          <textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2}
            className="w-full bg-bg-card border border-white/5 rounded-lg p-3 text-sm" placeholder="Ex: sem cebola, troco para R$ 50..." />
        </div>
      </div>

      <footer className="fixed bottom-[72px] left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-xl border-t border-white/5 p-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold">Total</div>
            <div className="text-lg font-black text-primary">{formatBRL(total)}</div>
          </div>
          <button onClick={finalizar} disabled={submitting}
            className="flex-1 h-12 bg-primary text-white rounded-lg font-bold disabled:opacity-50">
            {submitting ? "Enviando..." : "Finalizar pedido"}
          </button>
        </div>
      </footer>
    </div>
  );
}
