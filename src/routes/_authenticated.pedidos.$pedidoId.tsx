import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, Clock, CheckCircle2, ChefHat, Bike, XCircle, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL, cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/pedidos/$pedidoId")({
  component: PedidoDetalhePage,
});

const FLOW = ['pendente', 'confirmado', 'preparando', 'saiu', 'entregue'] as const;
const STATUS_META: Record<string, { color: string; icon: any; label: string }> = {
  pendente:   { color: "bg-yellow-500/10 text-yellow-500",  icon: Clock,         label: "Aguardando confirmação" },
  confirmado: { color: "bg-blue-500/10 text-blue-500",      icon: CheckCircle2,  label: "Confirmado" },
  preparando: { color: "bg-orange-500/10 text-orange-500",  icon: ChefHat,       label: "Preparando" },
  saiu:       { color: "bg-purple-500/10 text-purple-500",  icon: Bike,          label: "Saiu para entrega" },
  entregue:   { color: "bg-success/10 text-success",        icon: PackageCheck,  label: "Entregue" },
  cancelado:  { color: "bg-danger/10 text-danger",          icon: XCircle,       label: "Cancelado" },
};

const FORMA_LABEL: Record<string, string> = {
  dinheiro: '💵 Dinheiro na entrega',
  pix_entrega: '📱 Pix na entrega',
  cartao_credito: '💳 Cartão de crédito na entrega',
  cartao_debito: '💳 Cartão de débito na entrega',
};

function PedidoDetalhePage() {
  const { pedidoId } = useParams({ from: '/_authenticated/pedidos/$pedidoId' });
  const [pedido, setPedido] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [pRes, iRes] = await Promise.all([
        supabase.from('pedidos').select('*, lojas(nome, telefone, endereco), cupons(codigo)').eq('id', pedidoId).maybeSingle(),
        supabase.from('itens_pedido').select('*, produtos(nome, foto_url)').eq('pedido_id', pedidoId),
      ]);
      if (cancelled) return;
      setPedido(pRes.data);
      setItens(iRes.data || []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`pedido-${pedidoId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${pedidoId}` },
        (payload) => setPedido((prev: any) => prev ? { ...prev, ...payload.new } : prev)
      )
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [pedidoId]);

  const cancelar = async () => {
    if (!confirm('Cancelar este pedido?')) return;
    setCancelling(true);
    const { error } = await supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', pedidoId);
    setCancelling(false);
    if (error) toast.error(error.message);
    else toast.success('Pedido cancelado');
  };

  if (loading) return <div className="p-10 text-center text-text-muted">Carregando...</div>;
  if (!pedido) return <div className="p-10 text-center text-text-muted">Pedido não encontrado</div>;

  const meta = STATUS_META[pedido.status] || STATUS_META.pendente;
  const Icon = meta.icon;
  const flowIdx = FLOW.indexOf(pedido.status as any);
  const isCancelado = pedido.status === 'cancelado';
  const subtotal = Number(pedido.total) + Number(pedido.valor_desconto || 0);

  return (
    <div className="min-h-screen bg-bg-primary pb-32 px-4 pt-6">
      <Link to="/pedidos" className="inline-flex items-center gap-2 text-text-muted mb-6"><ChevronLeft size={18} /> Voltar</Link>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-mono text-text-muted">#{pedido.id.slice(0, 8).toUpperCase()}</div>
          <h1 className="text-xl font-black">{pedido.lojas?.nome}</h1>
          <div className="text-[10px] text-text-muted">{format(new Date(pedido.criado_em), 'dd MMM yyyy HH:mm', { locale: ptBR })}</div>
        </div>
        <div className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-lg", meta.color)}>
          <Icon size={20} />
          <span className="text-[9px] font-black uppercase">{meta.label}</span>
        </div>
      </div>

      {/* Linha do tempo */}
      {!isCancelado && (
        <div className="bg-bg-card border border-white/5 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            {FLOW.map((s, i) => {
              const M = STATUS_META[s];
              const done = i <= flowIdx;
              return (
                <div key={s} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div className={cn("absolute top-3 right-1/2 h-0.5 w-full -z-0",
                      i <= flowIdx ? "bg-primary" : "bg-white/10")} />
                  )}
                  <div className={cn("size-6 rounded-full flex items-center justify-center z-10 border-2 transition-all",
                    done ? "bg-primary border-primary text-white" : "bg-bg-card border-white/10 text-text-muted")}>
                    <M.icon size={12} />
                  </div>
                  <span className={cn("text-[8px] font-bold uppercase mt-1 text-center leading-tight",
                    done ? "text-text-primary" : "text-text-muted")}>{M.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-bg-card border border-white/5 rounded-lg p-4 space-y-3 mb-4">
        {itens.map(i => (
          <div key={i.id} className="flex items-center gap-3">
            <div className="size-12 rounded-md bg-white/5 overflow-hidden flex-shrink-0">
              {i.produtos?.foto_url && <img src={i.produtos.foto_url} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{i.produtos?.nome || 'Item'}</div>
              <div className="text-[11px] text-text-muted">{i.quantidade}× {formatBRL(i.preco_unitario)}</div>
            </div>
            <div className="text-sm font-bold text-primary">{formatBRL(i.quantidade * i.preco_unitario)}</div>
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-white/5 rounded-lg p-4 space-y-2 mb-4 text-sm">
        <div className="flex justify-between"><span className="text-text-muted">Entrega</span><span className="font-bold capitalize">{pedido.tipo_entrega}</span></div>
        {pedido.endereco_entrega && <div className="flex justify-between gap-4"><span className="text-text-muted">Endereço</span><span className="font-bold text-right">{pedido.endereco_entrega}</span></div>}
        {pedido.observacao && <div><div className="text-text-muted text-xs">Observação:</div><div className="text-sm">{pedido.observacao}</div></div>}

        {pedido.forma_pagamento && (
          <div className="flex justify-between"><span className="text-text-muted">Pagamento</span><span className="font-bold">{FORMA_LABEL[pedido.forma_pagamento] || pedido.forma_pagamento}</span></div>
        )}
        {pedido.troco_para && (
          <div className="flex justify-between"><span className="text-text-muted">Troco para</span><span className="font-bold">{formatBRL(Number(pedido.troco_para))}</span></div>
        )}

        <div className="flex justify-between pt-2 border-t border-white/5"><span className="text-text-muted">Subtotal</span><span className="font-bold">{formatBRL(subtotal)}</span></div>
        {Number(pedido.valor_desconto) > 0 && (
          <div className="flex justify-between text-success">
            <span>Cupom {pedido.cupons?.codigo ? `(${pedido.cupons.codigo})` : ''}</span>
            <span className="font-bold">- {formatBRL(Number(pedido.valor_desconto))}</span>
          </div>
        )}
        <div className="flex justify-between"><span className="text-text-muted">Total</span><span className="font-black text-primary text-lg">{formatBRL(pedido.total)}</span></div>
      </div>

      <div className="space-y-2">
        {pedido.lojas?.telefone && (
          <a href={`tel:${pedido.lojas.telefone.replace(/\D/g, '')}`} className="block w-full h-11 leading-[44px] bg-primary text-white font-bold rounded-lg text-center">
            Ligar para a loja
          </a>
        )}
        {pedido.status === 'pendente' && (
          <button onClick={cancelar} disabled={cancelling}
            className="block w-full h-11 bg-danger/10 text-danger border border-danger/30 font-bold rounded-lg disabled:opacity-50">
            {cancelling ? 'Cancelando...' : 'Cancelar pedido'}
          </button>
        )}
      </div>
    </div>
  );
}
