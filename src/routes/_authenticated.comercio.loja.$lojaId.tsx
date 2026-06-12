import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, Star, Clock, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/comercio/loja/$lojaId")({
  component: LojaPage,
});

function LojaPage() {
  const { lojaId } = useParams({ from: '/_authenticated/comercio/loja/$lojaId' });
  const [loja, setLoja] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { adicionarItem } = useCart();

  useEffect(() => {
    async function fetchData() {
      const [lRes, pRes] = await Promise.all([
        supabase.from('lojas').select('*').eq('id', lojaId).single(),
        supabase.from('produtos').select('*').eq('loja_id', lojaId).eq('ativo', true)
      ]);
      setLoja(lRes.data);
      setProdutos(pRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [lojaId]);

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!loja) return <div className="p-10 text-center">Loja não encontrada</div>;

  return (
    <div className="pb-32 bg-bg-primary min-h-screen">
      <div className="relative h-[180px] bg-white/5">
        {loja.banner_url && <img src={loja.banner_url} className="w-full h-full object-cover" alt={loja.nome} />}
        <Link to="/comercio" className="absolute top-6 left-4 size-10 rounded-full bg-black/40 flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </Link>
      </div>

      <div className="px-4 -mt-10 relative z-10 mb-6">
        <div className="bg-bg-card rounded-lg p-5 border border-white/5 shadow-card text-center">
          <h1 className="text-xl font-bold uppercase">{loja.nome}</h1>
          <p className="text-xs text-text-muted mt-1 uppercase font-black">{loja.categoria}</p>
          <p className="text-sm text-text-secondary mt-3">{loja.descricao}</p>
          <div className="flex justify-center gap-4 mt-4 text-xs font-bold text-text-muted">
            <span>📞 {loja.telefone}</span>
            <span>📍 {loja.endereco}</span>
          </div>
        </div>
      </div>

      <section className="px-4">
        <h2 className="section-title uppercase mb-4">Cardápio</h2>
        <div className="grid grid-cols-2 gap-4">
          {produtos.map((p) => (
            <div key={p.id} className="bg-bg-card rounded-md border border-white/5 overflow-hidden">
              <Link to={`/comercio/produto/${p.id}`} className="aspect-square bg-white/5 block">
                {p.imagem_url && <img src={p.imagem_url} className="w-full h-full object-cover" alt={p.nome} />}
              </Link>
              <div className="p-3">
                <h4 className="text-sm font-bold line-clamp-1">{p.nome}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-primary font-bold">R$ {p.preco.toFixed(2)}</span>
                  <button 
                    onClick={() => {
                      adicionarItem({ id: p.id, nome: p.nome, preco: p.preco, imagem_url: p.imagem_url, loja_id: p.loja_id });
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
      </section>
    </div>
  );
}
