import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Copy, Tag, Store as StoreIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatBRL } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/beneficios")({
  component: BeneficiosPage,
});

function descontoLabel(c: any) {
  return c.tipo_desconto === 'percentual'
    ? `${Number(c.valor_desconto)}% OFF`
    : `${formatBRL(Number(c.valor_desconto))} OFF`;
}

function validadeLabel(v: string | null) {
  if (!v) return 'Sem validade';
  const ms = new Date(v).getTime() - Date.now();
  if (ms <= 0) return 'Expirado';
  const dias = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (dias <= 1) return 'Expira hoje';
  return `Expira em ${dias} dias`;
}

function BeneficiosPage() {
  const [cupons, setCupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('cupons')
      .select('*, lojas(id, nome, logo_url, categoria)')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        const agora = Date.now();
        const validos = (data || []).filter(c =>
          (!c.validade || new Date(c.validade).getTime() > agora) &&
          (!c.limite_uso || (c.total_usado || 0) < c.limite_uso)
        );
        setCupons(validos);
        setLoading(false);
      });
  }, []);

  const copiar = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      toast.success(`Código ${codigo} copiado!`);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-32 px-4 pt-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-text-muted mb-4">
        <ChevronLeft size={18} /> Voltar
      </Link>
      <h1 className="text-2xl font-black mb-1">⭐ Benefícios</h1>
      <p className="text-xs text-text-muted uppercase font-bold mb-6">Cupons das lojas parceiras</p>

      {loading ? (
        <p className="text-center text-text-muted text-sm py-10">Carregando...</p>
      ) : cupons.length === 0 ? (
        <div className="py-20 text-center text-text-muted opacity-60">
          <Tag size={48} className="mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Nenhum cupom ativo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cupons.map(c => (
            <div key={c.id} className="p-4 bg-bg-card border border-white/5 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-md bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {c.lojas?.logo_url
                    ? <img src={c.lojas.logo_url} className="w-full h-full object-cover" />
                    : <StoreIcon size={18} className="text-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  {c.lojas?.id ? (
                    <Link to="/comercio/loja/$lojaId" params={{ lojaId: c.lojas.id }} className="text-sm font-bold truncate block">
                      {c.lojas?.nome || 'Loja'}
                    </Link>
                  ) : (
                    <div className="text-sm font-bold truncate">{c.lojas?.nome || 'Loja'}</div>
                  )}
                  <div className="text-[10px] text-text-muted uppercase">{c.lojas?.categoria}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-primary">{descontoLabel(c)}</div>
                </div>
              </div>

              {c.descricao && <p className="text-xs text-text-secondary mb-3">{c.descricao}</p>}

              <div className="flex items-center justify-between gap-2 bg-white/5 rounded-lg p-2">
                <code className="text-base font-black tracking-wider text-primary">{c.codigo}</code>
                <button onClick={() => copiar(c.codigo)} className="h-8 px-3 rounded-md bg-primary text-white text-[10px] font-bold uppercase flex items-center gap-1">
                  <Copy size={12} /> Copiar
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
                <span>{validadeLabel(c.validade)}</span>
                {Number(c.valor_minimo_pedido) > 0 && <span>Min: {formatBRL(Number(c.valor_minimo_pedido))}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
