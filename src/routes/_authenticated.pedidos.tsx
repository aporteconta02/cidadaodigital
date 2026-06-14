import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL, cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pedidos")({
  component: PedidosPage,
});

const STATUS_COLOR: Record<string, string> = {
  pendente: "bg-yellow-500/10 text-yellow-500",
  confirmado: "bg-blue-500/10 text-blue-500",
  preparando: "bg-orange-500/10 text-orange-500",
  saiu: "bg-purple-500/10 text-purple-500",
  entregue: "bg-success/10 text-success",
  cancelado: "bg-danger/10 text-danger",
};

function PedidosPage() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    supabase.from('pedidos').select('*, lojas(nome)').eq('comprador_id', usuario.id).order('criado_em', { ascending: false })
      .then(({ data }) => { setPedidos(data || []); setLoading(false); });
  }, [usuario]);

  return (
    <div className="min-h-screen bg-bg-primary pb-32 px-4 pt-6">
      <Link to="/perfil" className="inline-flex items-center gap-2 text-text-muted mb-6"><ChevronLeft size={18} /> Voltar</Link>
      <h1 className="text-2xl font-black mb-6">Meus Pedidos</h1>

      {loading ? (
        <div className="text-text-muted text-sm text-center py-10">Carregando...</div>
      ) : pedidos.length === 0 ? (
        <div className="py-20 text-center text-text-muted opacity-50">
          <Package size={48} className="mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhum pedido ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => (
            <Link key={p.id} to={`/pedidos/${p.id}`} className="flex items-center gap-3 p-4 bg-bg-card border border-white/5 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-text-muted">#{p.id.slice(0, 8).toUpperCase()}</span>
                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", STATUS_COLOR[p.status] || "bg-white/5 text-text-muted")}>{p.status}</span>
                </div>
                <div className="text-sm font-bold truncate">{p.lojas?.nome || 'Loja'}</div>
                <div className="text-[10px] text-text-muted">{format(new Date(p.criado_em), 'dd MMM yyyy HH:mm', { locale: ptBR })}</div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-primary">{formatBRL(p.total)}</div>
              </div>
              <ChevronRight size={16} className="text-text-muted" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
