import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Plus, ShoppingBag, Store, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn, formatBRL } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [lojasPremium, setLojasPremium] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { adicionarItem, totalItens } = useCart();
  const { usuario } = useAuth();

  useEffect(() => {
    supabase.from('banners').select('*').eq('ativo', true).order('posicao').limit(5)
      .then(({ data }) => setBanners(data || []));
    supabase.from('lojas').select('*').eq('aprovada', true).eq('plano', 'premium').eq('ativo', true).limit(10)
      .then(({ data }) => setLojasPremium(data || []));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let lojasQuery = supabase.from('lojas').select('*, parceiros_clube(id)').eq('aprovada', true).eq('ativo', true);
        let produtosQuery = supabase.from('produtos').select('*, lojas!inner(*, parceiros_clube(id))').eq('ativo', true).eq('lojas.aprovada', true);

        if (activeCategory) {
          lojasQuery = lojasQuery.eq('categoria', activeCategory);
          produtosQuery = produtosQuery.eq('categoria', activeCategory);
        }
        if (search) {
          lojasQuery = lojasQuery.ilike('nome', `%${search}%`);
          produtosQuery = produtosQuery.ilike('nome', `%${search}%`);
        }

        const [lRes, pRes] = await Promise.all([lojasQuery, produtosQuery]);
        if (lRes.error) throw new Error("Erro ao carregar lojas");
        if (pRes.error) throw new Error("Erro ao carregar produtos");

        setLojas(lRes.data || []);
        setProdutos(pRes.data || []);
      } catch (err: any) {
        toast.error(err.message || "Erro de conexão");
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, search]);

  return (
    <div className="pb-32 animate-in fade-in duration-500 bg-bg-primary min-h-screen">
      <header className="px-4 pt-4 mb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            placeholder="Buscar produtos ou lojas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A24] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-text-primary focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </header>

      {/* Banners */}
      {banners.length > 0 && (
        <section className="mb-6">
          <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
            {banners.map(b => (
              <a key={b.id} href={b.link_destino || '#'} className="flex-[0_0_85%] h-[120px] rounded-xl overflow-hidden bg-white/5 relative">
                <img src={b.imagem_url} alt={b.titulo || ''} className="w-full h-full object-cover" />
                {b.titulo && <div className="absolute bottom-2 left-3 text-white text-sm font-bold drop-shadow">{b.titulo}</div>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="mb-6 overflow-hidden">
        <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
                activeCategory === cat.id
                  ? "bg-primary border-primary text-text-primary shadow-glow"
                  : "bg-[#1A1A24] border-white/5 text-text-secondary"
              )}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Lojas Premium destaque */}
      {lojasPremium.length > 0 && (
        <section className="mb-8">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="section-title uppercase tracking-tighter italic">Lojas em destaque</h2>
            <span className="text-[9px] font-black text-gold uppercase tracking-widest">Premium</span>
          </div>
          <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-2">
            {lojasPremium.map((store) => (
              <Link key={store.id} to={`/comercio/loja/${store.id}`} className="flex-[0_0_180px] group">
                <div className="h-[100px] rounded-t-xl overflow-hidden bg-white/5">
                  {store.logo_url
                    ? <img src={store.logo_url} className="w-full h-full object-cover" alt={store.nome} />
                    : <div className="w-full h-full flex items-center justify-center text-text-muted opacity-20"><Store size={32} /></div>}
                </div>
                <div className="bg-bg-card rounded-b-xl p-3 border border-white/5">
                  <h4 className="text-sm font-bold text-text-primary truncate">{store.nome}</h4>
                  <p className="text-[10px] text-gold uppercase font-black tracking-widest">⭐ Premium</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {loading ? (
        <div className="px-4 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        </div>
      ) : (
        <>
          {lojas.length > 0 && (
            <section className="mb-8">
              <div className="px-4 mb-3">
                <h2 className="section-title uppercase tracking-tighter italic">Lojas</h2>
              </div>
              <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-2">
                {lojas.map((store) => (
                  <Link key={store.id} to={`/comercio/loja/${store.id}`} className="flex-[0_0_200px] group">
                    <div className="h-[100px] rounded-t-xl overflow-hidden bg-white/5">
                      {store.logo_url
                        ? <img src={store.logo_url} className="w-full h-full object-cover" alt={store.nome} />
                        : <div className="w-full h-full flex items-center justify-center text-text-muted opacity-20"><Store size={32} /></div>}
                    </div>
                    <div className="bg-bg-card rounded-b-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-text-primary truncate flex-1">{store.nome}</h4>
                        {store.parceiros_clube?.length > 0 && (
                          <span className="text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded">CLUBE+</span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{store.categoria}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="px-4">
            <h2 className="section-title uppercase tracking-tighter mb-4 italic">Produtos</h2>
            {produtos.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <ShoppingBag size={48} className="mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {produtos.map((product) => {
                  const isParceiro = product.lojas?.parceiros_clube?.length > 0;
                  const precoExibido = isParceiro && usuario?.assinante_plus ? product.preco * 0.9 : product.preco;

                  return (
                    <div key={product.id} className="bg-bg-card rounded-2xl overflow-hidden border border-white/5 flex flex-col group">
                      <Link to={`/comercio/produto/${product.id}`} className="aspect-square bg-white/5 relative overflow-hidden">
                        {product.foto_url
                          ? <img src={product.foto_url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt={product.nome} />
                          : <div className="w-full h-full flex items-center justify-center text-text-muted opacity-10"><ShoppingBag size={48} /></div>}
                        {isParceiro && usuario?.assinante_plus && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-[8px] font-black uppercase rounded shadow-lg">-10% CLUBE+</div>
                        )}
                      </Link>
                      <div className="p-3">
                        <h4 className="text-[13px] font-semibold text-text-primary line-clamp-1">{product.nome}</h4>
                        <p className="micro-text text-text-muted font-bold uppercase mb-2 line-clamp-1">{product.lojas?.nome}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {isParceiro && usuario?.assinante_plus && (
                              <span className="text-[9px] text-text-muted line-through">{formatBRL(product.preco)}</span>
                            )}
                            <span className="text-base font-bold text-primary italic">{formatBRL(precoExibido)}</span>
                          </div>
                          <button
                            onClick={() => {
                              adicionarItem({
                                id: product.id,
                                nome: product.nome,
                                preco: precoExibido,
                                imagem_url: product.foto_url,
                                loja_id: product.loja_id
                              });
                              toast.success("Adicionado!");
                            }}
                            className="size-9 rounded-xl bg-secondary text-text-primary flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-secondary/20"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Floating cart button */}
      {totalItens > 0 && (
        <Link
          to="/carrinho"
          className="fixed bottom-24 right-4 z-40 bg-primary text-white rounded-full h-14 px-5 flex items-center gap-2 shadow-glow active:scale-95 transition-transform"
        >
          <ShoppingCart size={20} />
          <span className="font-bold text-sm">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
        </Link>
      )}
    </div>
  );
}
