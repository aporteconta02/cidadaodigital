import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, Plus, Phone, MapPin, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { cn, formatBRL } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/comercio/loja/$lojaId")({
  component: LojaPage,
});

function LojaPage() {
  const { lojaId } = useParams({ from: '/_authenticated/comercio/loja/$lojaId' });
  const [loja, setLoja] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'produtos' | 'sobre' | 'contato'>('produtos');
  const { adicionarItem } = useCart();

  useEffect(() => {
    async function fetchData() {
      const [lRes, pRes] = await Promise.all([
        supabase.from('lojas').select('*').eq('id', lojaId).maybeSingle(),
        supabase.from('produtos').select('*').eq('loja_id', lojaId).eq('ativo', true)
      ]);
      setLoja(lRes.data);
      setProdutos(pRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [lojaId]);

  if (loading) return <div className="p-10 text-center text-text-muted">Carregando...</div>;
  if (!loja) return <div className="p-10 text-center text-text-muted">Loja não encontrada</div>;

  return (
    <div className="pb-32 bg-bg-primary min-h-screen">
      <div className="relative h-[180px] bg-white/5">
        {loja.banner_url && <img src={loja.banner_url} className="w-full h-full object-cover" alt={loja.nome} />}
        <Link to="/comercio" className="absolute top-6 left-4 size-10 rounded-full bg-black/40 flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </Link>
      </div>

      <div className="px-4 -mt-10 relative z-10 mb-4">
        <div className="bg-bg-card rounded-lg p-5 border border-white/5 shadow-card text-center">
          <h1 className="text-xl font-bold uppercase">{loja.nome}</h1>
          <p className="text-xs text-text-muted mt-1 uppercase font-black">{loja.categoria}</p>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="flex gap-2 border-b border-white/5">
          {(['produtos', 'sobre', 'contato'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
                tab === t ? "border-primary text-primary" : "border-transparent text-text-muted")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'produtos' && (
        <section className="px-4">
          {produtos.length === 0 ? (
            <div className="py-16 text-center text-text-muted opacity-50">
              <Package size={40} className="mx-auto mb-3" />
              <p className="text-sm">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {produtos.map((p) => (
                <div key={p.id} className="bg-bg-card rounded-md border border-white/5 overflow-hidden">
                  <Link to="/comercio/produto/$produtoId" params={{ produtoId: p.id }} className="aspect-square bg-white/5 block">
                    {p.foto_url && <img src={p.foto_url} className="w-full h-full object-cover" alt={p.nome} />}
                  </Link>
                  <div className="p-3">
                    <h4 className="text-sm font-bold line-clamp-1">{p.nome}</h4>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-primary font-bold">{formatBRL(p.preco)}</span>
                      <button
                        onClick={() => {
                          adicionarItem({ id: p.id, nome: p.nome, preco: p.preco, imagem_url: p.foto_url, loja_id: p.loja_id });
                          toast.success("Adicionado!");
                        }}
                        className="size-8 rounded-full bg-secondary text-text-primary flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'sobre' && (
        <section className="px-4">
          <div className="bg-bg-card rounded-lg p-5 border border-white/5">
            <p className="text-sm text-text-secondary leading-relaxed">{loja.descricao || 'Sem descrição.'}</p>
          </div>
        </section>
      )}

      {tab === 'contato' && (
        <section className="px-4 space-y-3">
          {loja.telefone && (
            <a href={`tel:${loja.telefone.replace(/\D/g, '')}`} className="flex items-center gap-3 p-4 bg-bg-card rounded-lg border border-white/5">
              <Phone size={18} className="text-primary" />
              <span className="text-sm font-bold">{loja.telefone}</span>
            </a>
          )}
          {loja.endereco && (
            <div className="flex items-center gap-3 p-4 bg-bg-card rounded-lg border border-white/5">
              <MapPin size={18} className="text-primary" />
              <span className="text-sm">{loja.endereco}</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
