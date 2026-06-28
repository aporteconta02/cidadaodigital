import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Package, Clock, CheckCircle2, ChefHat, Bike, XCircle, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL, cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pedidos")({
  component: PedidosPage,
});

const STATUS_META: Record<string, { color: string; icon: any; label: string }> = {
  pendente:   { color: "bg-yellow-500/10 text-yellow-500",  icon: Clock,         label: "Aguardando" },
  confirmado: { color: "bg-blue-500/10 text-blue-500",      icon: CheckCircle2,  label: "Confirmado" },
  preparando: { color: "bg-orange-500/10 text-orange-500",  icon: ChefHat,       label: "Preparando" },
  saiu:       { color: "bg-purple-500/10 text-purple-500",  icon: Bike,          label: "Saiu p/ entrega" },
  entregue:   { color: "bg-success/10 text-success",        icon: PackageCheck,  label: "Entregue" },
  cancelado:  { color: "bg-danger/10 text-danger",          icon: XCircle,       label: "Cancelado" },
};

function PedidosPage() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    let cancelled = false;
    const load = () => supabase.from('pedidos')
      .select('*, lojas(nome)')
      .eq('comprador_id', usuario.id)
      .order('criado_em', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error(error);
        else setPedidos(data || []);
        setLoading(false);
      });
    load();

    const channel = supabase
      .channel(`pedidos-cli-${usuario.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos', filter: `comprador_id=eq.${usuario.id}` },
        () => load()
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [usuario]);

  return (
    <div className="min-h-screen bg-bg-primary pb-32 px-4 pt-6">
      <Link to="/perfil" className="inline-flex items-center gap-2 text-text-muted mb-6"><ChevronLeft size={18} /> Voltar</Link>
      <h1 className="text-2xl font-black mb-1">Meus Pedidos</h1>
      <p className="text-xs text-text-muted uppercase font-bold mb-6">Atualiza em tempo real</p>

      {loading ? (
        <div className="text-text-muted text-sm text-center py-10">Carregando...</div>
      ) : pedidos.length === 0 ? (
        <div className="py-20 text-center text-text-muted opacity-50">
          <Package size={48} className="mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhum pedido ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => {
            const meta = STATUS_META[p.status] || STATUS_META.pendente;
            const Icon = meta.icon;
            return (
              <Link key={p.id} to="/pedidos/$pedidoId" params={{ pedidoId: p.id }}
                className="flex items-center gap-3 p-4 bg-bg-card border border-white/5 rounded-lg hover:border-primary/40 transition-colors">
                <div className={cn("size-10 rounded-lg flex items-center justify-center", meta.color)}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-text-muted">#{p.id.slice(0, 8).toUpperCase()}</span>
                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", meta.color)}>{meta.label}</span>
                  </div>
                  <div className="text-sm font-bold truncate">{p.lojas?.nome || 'Loja'}</div>
                  <div className="text-[10px] text-text-muted">{format(new Date(p.criado_em), 'dd MMM yyyy HH:mm', { locale: ptBR })}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-primary">{formatBRL(p.total)}</div>
                  {Number(p.valor_desconto) > 0 && (
                    <div className="text-[9px] text-success font-bold">cupom -{formatBRL(Number(p.valor_desconto))}</div>
                  )}
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
