import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingCart, Tag, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn, formatBRL } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/carrinho")({
  component: CarrinhoPage,
});

const FORMAS_PAGAMENTO = [
  { value: 'dinheiro',        label: 'Dinheiro na entrega',         icon: '💵' },
  { value: 'pix_entrega',     label: 'Pix na entrega',              icon: '📱' },
  { value: 'cartao_credito',  label: 'Cartão de crédito na entrega',icon: '💳' },
  { value: 'cartao_debito',   label: 'Cartão de débito na entrega', icon: '💳' },
] as const;

type FormaPagamento = typeof FORMAS_PAGAMENTO[number]['value'];

function CarrinhoPage() {
  const { itens, alterarQuantidade, removerItem, limparCarrinho, total } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [tipoEntrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada');
  const [endereco, setEndereco] = useState(usuario ? `${usuario.bairro || ''} - ${usuario.cidade || ''}` : '');
  const [observacao, setObservacao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('dinheiro');
  const [trocoPara, setTrocoPara] = useState<string>('');

  // Cupom
  const [codigoCupom, setCodigoCupom] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState<any | null>(null);
  const [validandoCupom, setValidandoCupom] = useState(false);

  // Group by loja (apenas itens com loja_id válida)
  const porLoja = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};
    for (const it of itens) {
      if (!it.loja_id) continue;
      (groups[it.loja_id] ||= []).push(it);
    }
    return groups;
  }, [itens]);

  const itensInvalidos = useMemo(() => itens.filter(it => !it.loja_id), [itens]);
  const lojaIds = Object.keys(porLoja);
  const cupomLojaId = lojaIds.length === 1 ? lojaIds[0] : null;

  const subtotalLojaCupom = useMemo(() => {
    if (!cupomLojaId) return 0;
    return porLoja[cupomLojaId].reduce((s, it) => s + it.produto.preco * it.quantidade, 0);
  }, [porLoja, cupomLojaId]);

  const desconto = useMemo(() => {
    if (!cupomAplicado) return 0;
    const base = subtotalLojaCupom;
    if (cupomAplicado.tipo_desconto === 'percentual') {
      return Math.min(base, base * (Number(cupomAplicado.valor_desconto) / 100));
    }
    return Math.min(base, Number(cupomAplicado.valor_desconto));
  }, [cupomAplicado, subtotalLojaCupom]);

  const totalFinal = Math.max(0, total - desconto);

  const aplicarCupom = async () => {
    const codigo = codigoCupom.trim().toUpperCase();
    if (!codigo) return;
    if (!cupomLojaId) {
      toast.error('Cupons só funcionam quando o carrinho tem itens de 1 única loja.');
      return;
    }
    setValidandoCupom(true);
    try {
      const { data, error } = await supabase.from('cupons')
        .select('*')
        .eq('loja_id', cupomLojaId)
        .eq('codigo', codigo)
        .eq('ativo', true)
        .maybeSingle();
      if (error) throw error;
      if (!data) { toast.error('Cupom inválido'); return; }
      if (data.validade && new Date(data.validade) < new Date()) {
        toast.error('Cupom expirado'); return;
      }
      if (data.limite_uso && (data.total_usado || 0) >= data.limite_uso) {
        toast.error('Cupom esgotado'); return;
      }
      if (subtotalLojaCupom < Number(data.valor_minimo_pedido)) {
        toast.error(`Pedido mínimo: ${formatBRL(Number(data.valor_minimo_pedido))}`);
        return;
      }
      setCupomAplicado(data);
      toast.success('✅ Cupom aplicado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao validar cupom');
    } finally {
      setValidandoCupom(false);
    }
  };

  const removerCupom = () => { setCupomAplicado(null); setCodigoCupom(''); };

  const finalizar = async () => {
    if (!usuario) return toast.error("Faça login primeiro");
    if (itens.length === 0) return toast.error("Carrinho vazio");
    if (itensInvalidos.length > 0) return toast.error("Há itens sem loja associada. Remova-os para continuar.");
    if (lojaIds.length === 0) return toast.error("Nenhum item válido para finalizar");
    if (tipoEntrega === 'entrega' && !endereco.trim()) return toast.error("Informe o endereço de entrega");
    if (!formaPagamento) return toast.error("Escolha a forma de pagamento");
    const trocoNum = formaPagamento === 'dinheiro' && trocoPara
      ? parseFloat(trocoPara.replace(',', '.')) : null;
    if (trocoNum != null && (isNaN(trocoNum) || trocoNum < totalFinal)) {
      return toast.error("Troco deve ser maior ou igual ao total");
    }

    setSubmitting(true);
    try {
      const pedidosCriados: any[] = [];
      for (const lojaId of lojaIds) {
        const itensLoja = porLoja[lojaId];
        const subtotalLoja = itensLoja.reduce((s, it) => s + it.produto.preco * it.quantidade, 0);
        const aplicaCupom = cupomAplicado && cupomAplicado.loja_id === lojaId;
        const descontoLoja = aplicaCupom ? desconto : 0;
        const totalLoja = Math.max(0, subtotalLoja - descontoLoja);

        const { data: pedido, error: pErr } = await supabase.from('pedidos').insert({
          comprador_id: usuario.id,
          loja_id: lojaId,
          status: 'pendente',
          tipo_entrega: tipoEntrega,
          total: totalLoja,
          endereco_entrega: tipoEntrega === 'entrega' ? endereco : null,
          observacao: observacao || null,
          cupom_id: aplicaCupom ? cupomAplicado.id : null,
          valor_desconto: descontoLoja,
          forma_pagamento: formaPagamento,
          troco_para: formaPagamento === 'dinheiro' ? trocoNum : null,
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
    <div className="pb-48 min-h-screen bg-bg-primary">
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
        {/* Cupom */}
        <div>
          <label className="text-[10px] font-black uppercase text-text-muted mb-2 block flex items-center gap-1"><Tag size={12} /> Cupom de desconto</label>
          {cupomAplicado ? (
            <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-lg p-3">
              <div>
                <div className="text-xs font-black text-success uppercase">{cupomAplicado.codigo}</div>
                <div className="text-[10px] text-text-muted">Desconto de {formatBRL(desconto)}</div>
              </div>
              <button onClick={removerCupom} className="size-7 rounded-md bg-white/5 flex items-center justify-center text-danger"><X size={14} /></button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={codigoCupom} onChange={e => setCodigoCupom(e.target.value.toUpperCase())} placeholder="Tem um cupom?"
                className="flex-1 bg-bg-card border border-white/5 rounded-lg p-3 text-sm uppercase tracking-wider" />
              <button onClick={aplicarCupom} disabled={validandoCupom || !codigoCupom.trim()}
                className="h-11 px-4 rounded-lg bg-primary text-white text-xs font-bold uppercase disabled:opacity-50">
                {validandoCupom ? '...' : 'Aplicar'}
              </button>
            </div>
          )}
          {!cupomLojaId && lojaIds.length > 1 && (
            <p className="text-[10px] text-text-muted mt-1">Cupons só são aceitos com itens de uma única loja.</p>
          )}
        </div>

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

        {/* Forma de pagamento */}
        <div>
          <label className="text-[10px] font-black uppercase text-text-muted mb-2 block">Forma de pagamento</label>
          <div className="grid grid-cols-2 gap-2">
            {FORMAS_PAGAMENTO.map(f => (
              <button key={f.value} onClick={() => setFormaPagamento(f.value)}
                className={cn("p-3 rounded-lg text-left border transition-all",
                  formaPagamento === f.value
                    ? "bg-primary/10 border-primary text-text-primary"
                    : "bg-bg-card border-white/5 text-text-secondary")}>
                <div className="text-lg leading-none mb-1">{f.icon}</div>
                <div className="text-[11px] font-bold leading-tight">{f.label}</div>
              </button>
            ))}
          </div>
        </div>

        {formaPagamento === 'dinheiro' && (
          <div>
            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block">Troco para quanto? (opcional)</label>
            <input value={trocoPara} onChange={e => setTrocoPara(e.target.value)} inputMode="decimal"
              className="w-full bg-bg-card border border-white/5 rounded-lg p-3 text-sm" placeholder={`Ex: ${formatBRL(totalFinal + 10)}`} />
          </div>
        )}

        <div>
          <label className="text-[10px] font-black uppercase text-text-muted mb-2 block">Observação (opcional)</label>
          <textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2}
            className="w-full bg-bg-card border border-white/5 rounded-lg p-3 text-sm" placeholder="Ex: sem cebola, troco para R$ 50..." />
        </div>

        {/* Resumo */}
        <div className="bg-bg-card border border-white/5 rounded-lg p-4 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-text-muted">📦 Itens</span><span className="font-bold">{formatBRL(total)}</span></div>
          {desconto > 0 && (
            <div className="flex justify-between text-success"><span>🎟️ Desconto cupom</span><span className="font-bold">- {formatBRL(desconto)}</span></div>
          )}
          <div className="flex justify-between pt-2 border-t border-white/5"><span className="text-text-muted">💰 Total</span><span className="font-black text-primary text-base">{formatBRL(totalFinal)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-text-muted">💳 Forma</span><span className="font-bold">{FORMAS_PAGAMENTO.find(f => f.value === formaPagamento)?.label}</span></div>
          {formaPagamento === 'dinheiro' && trocoPara && (
            <div className="flex justify-between text-xs"><span className="text-text-muted">💬 Troco para</span><span className="font-bold">{trocoPara}</span></div>
          )}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-xl border-t border-white/5 p-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold">Total</div>
            <div className="text-lg font-black text-primary">{formatBRL(totalFinal)}</div>
          </div>
          <button onClick={finalizar} disabled={submitting}
            className="flex-1 h-12 bg-primary text-white rounded-lg font-bold disabled:opacity-50">
            {submitting ? "Enviando..." : "✅ Confirmar pedido"}
          </button>
        </div>
      </footer>
    </div>
  );
}
