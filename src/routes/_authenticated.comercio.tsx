import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, ChevronRight, Plus, MapPin, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/comercio")({
  component: ComercioPage,
});

const CATEGORIES = [
  { id: 'alimento', label: "Comida", icon: "🍕" },
  { id: 'moda', label: "Moda", icon: "👗" },
  { id: 'farma', label: "Farmácia", icon: "💊" },
  { id: 'mercado', label: "Mercado", icon: "🛒" },
  { id: 'pet', label: "Pet", icon: "🐾" },
  { id: 'servico', label: "Serviços", icon: "💇" },
  { id: 'outro', label: "Outros", icon: "🛠️" },
];

function ComercioPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lojas, setLojas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { adicionarItem } = useCart();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let lojasQuery = supabase.from('lojas').select('*, parceiros_clube(id)').eq('aprovada', true).eq('ativo', true);
      let produtosQuery = supabase.from('produtos').select('*, lojas!inner(*, parceiros_clube(id))').eq('ativo', true);

      if (activeCategory) {
        lojasQuery = lojasQuery.eq('categoria', activeCategory.toLowerCase());
        produtosQuery = produtosQuery.eq('categoria', activeCategory.toLowerCase());
      }

      if (search) {
        lojasQuery = lojasQuery.ilike('nome', `%${search}%`);
        produtosQuery = produtosQuery.ilike('nome', `%${search}%`);
      }

      const [lRes, pRes] = await Promise.all([lojasQuery, produtosQuery]);
      setLojas(lRes.data || []);
      setProdutos(pRes.data || []);
      setLoading(false);
    }
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, search]);

  return (
    <div className="pb-32 animate-in fade-in duration-500 bg-bg-primary">
      <header className="px-4 pt-4 mb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            placeholder="Buscar produtos ou lojas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A24] border border-white/5 rounded-md py-3.5 pl-12 pr-4 text-sm font-medium text-text-primary"
          />
        </div>
      </header>

      <section className="mb-6 overflow-hidden">
        <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
                activeCategory === cat.label 
                  ? "bg-primary border-primary text-text-primary shadow-glow" 
                  : "bg-[#1A1A24] border-white/5 text-text-secondary"
              )}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="px-4 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <>
          <section className="mb-8">
            <div className="px-4 flex items-center justify-between mb-4">
              <h2 className="section-title uppercase tracking-tighter">Lojas</h2>
            </div>
            <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-2">
              {lojas.map((store) => (
                <Link key={store.id} to={`/comercio/loja/${store.id}`} className="flex-[0_0_200px] group">
                  <div className="h-[100px] rounded-t-md overflow-hidden bg-white/5">
                    {store.logo_url && <img src={store.logo_url} className="w-full h-full object-cover" alt={store.nome} />}
                  </div>
                  <div className="bg-bg-card rounded-b-md p-3 border border-white/5">
                    <h4 className="text-sm font-bold text-text-primary truncate">{store.nome}</h4>
                    <p className="text-[10px] text-text-muted mt-1 uppercase font-black">{store.categoria}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="px-4">
            <h2 className="section-title uppercase tracking-tighter mb-4">Produtos</h2>
            <div className="grid grid-cols-2 gap-4">
              {produtos.map((product) => (
                <div key={product.id} className="bg-bg-card rounded-md overflow-hidden border border-white/5 flex flex-col">
                  <Link to={`/comercio/produto/${product.id}`} className="aspect-square bg-white/5">
                    {product.imagem_url && <img src={product.imagem_url} className="w-full h-full object-cover" alt={product.nome} />}
                  </Link>
                  <div className="p-3">
                    <h4 className="text-[13px] font-semibold text-text-primary line-clamp-1">{product.nome}</h4>
                    <p className="micro-text text-text-muted font-bold uppercase mb-2">{product.lojas?.nome}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-primary">R$ {product.preco.toFixed(2)}</span>
                      <button 
                        onClick={() => {
                          adicionarItem({ id: product.id, nome: product.nome, preco: product.preco, imagem_url: product.imagem_url, loja_id: product.loja_id });
                          toast.success("Adicionado!");
                        }}
                        className="size-8 rounded-full bg-secondary text-text-primary flex items-center justify-center"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
