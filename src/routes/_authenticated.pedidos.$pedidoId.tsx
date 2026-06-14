import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL, cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pedidos/$pedidoId")({
  component: PedidoDetalhePage,
});

const STATUS_COLOR: Record<string, string> = {
  pendente: "bg-yellow-500/10 text-yellow-500",
  confirmado: "bg-blue-500/10 text-blue-500",
  preparando: "bg-orange-500/10 text-orange-500",
  saiu: "bg-purple-500/10 text-purple-500",
  entregue: "bg-success/10 text-success",
  cancelado: "bg-danger/10 text-danger",
};

function PedidoDetalhePage() {
  const { pedidoId } = useParams({ from: '/_authenticated/pedidos/$pedidoId' });
  const [pedido, setPedido] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pRes, iRes] = await Promise.all([
        supabase.from('pedidos').select('*, lojas(nome, telefone, endereco)').eq('id', pedidoId).maybeSingle(),
        supabase.from('itens_pedido').select('*, produtos(nome, foto_url)').eq('pedido_id', pedidoId),
      ]);
      setPedido(pRes.data);
      setItens(iRes.data || []);
      setLoading(false);
    })();
  }, [pedidoId]);

  if (loading) return <div className="p-10 text-center text-text-muted">Carregando...</div>;
  if (!pedido) return <div className="p-10 text-center text-text-muted">Pedido não encontrado</div>;

  return (
    <div className="min-h-screen bg-bg-primary pb-32 px-4 pt-6">
      <Link to="/pedidos" className="inline-flex items-center gap-2 text-text-muted mb-6"><ChevronLeft size={18} /> Voltar</Link>

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-mono text-text-muted">#{pedido.id.slice(0, 8).toUpperCase()}</div>
          <h1 className="text-xl font-black">{pedido.lojas?.nome}</h1>
          <div className="text-[10px] text-text-muted">{format(new Date(pedido.criado_em), 'dd MMM yyyy HH:mm', { locale: ptBR })}</div>
        </div>
        <span className={cn("text-[10px] font-black uppercase px-3 py-1 rounded", STATUS_COLOR[pedido.status] || "bg-white/5")}>{pedido.status}</span>
      </div>

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
        <div className="flex justify-between pt-2 border-t border-white/5"><span className="text-text-muted">Total</span><span className="font-black text-primary text-lg">{formatBRL(pedido.total)}</span></div>
      </div>

      {pedido.lojas?.telefone && (
        <a href={`tel:${pedido.lojas.telefone.replace(/\D/g, '')}`} className="block w-full h-11 leading-[44px] bg-primary text-white font-bold rounded-lg text-center">
          Ligar para a loja
        </a>
      )}
    </div>
  );
}
