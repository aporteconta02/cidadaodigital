import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Star, Zap, ChevronRight, Store, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/comercio")({
  component: ComercioPage,
});

const CATEGORIES = [
  { id: 'alimento', label: "Alimentação", icon: "🍕" },
  { id: 'moda', label: "Moda", icon: "👕" },
  { id: 'servico', label: "Serviços", icon: "🛠️" },
  { id: 'artes', label: "Artesanato", icon: "🎨" },
  { id: 'farma', label: "Farmácia", icon: "💊" },
  { id: 'pet', label: "Pet", icon: "🐾" },
];

const FEATURED_STORES = [
  { id: '1', name: "Padaria do Sol", category: "Alimentação", rating: 4.8, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300" },
  { id: '2', name: "Pet Shop Amigo", category: "Pet", rating: 4.9, image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=300" },
  { id: '3', name: "Boutique Fashion", category: "Moda", rating: 4.7, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=300" },
];

const ALL_PRODUCTS = [
  { id: '1', name: "Pão Francês Unit.", price: 0.80, store: "Padaria do Sol", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=300" },
  { id: '2', name: "Ração Premium 1kg", price: 45.90, store: "Pet Shop Amigo", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300" },
  { id: '3', name: "Camiseta Algodão", price: 59.90, store: "Boutique Fashion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=300" },
  { id: '4', name: "Bolo de Cenoura", price: 18.00, store: "Padaria do Sol", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300" },
];

function ComercioPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      {/* Search Header */}
      <div className="px-6 pt-4 mb-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            placeholder="Buscar lojas ou produtos..." 
            className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-standard"
          />
        </div>
      </div>

      {/* Categories Scroller */}
      <section className="mb-8">
        <div className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory("Todos")}
            className={cn(
              "whitespace-nowrap px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border",
              activeCategory === "Todos" ? "bg-primary border-primary text-primary-foreground shadow-standard" : "bg-card border-white/5 text-muted-foreground"
            )}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.label)}
              className={cn(
                "whitespace-nowrap px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2",
                activeCategory === cat.label ? "bg-primary border-primary text-primary-foreground shadow-standard" : "bg-card border-white/5 text-muted-foreground"
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Stores */}
      <section className="mb-10">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Lojas em Destaque</h2>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary">Ver todas</button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
          {FEATURED_STORES.map((store) => (
            <Link 
              key={store.id} 
              to={`/comercio/loja/${store.id}`}
              className="flex-[0_0_240px] bg-card rounded-3xl overflow-hidden border border-white/5 shadow-standard group"
            >
              <div className="relative h-32 overflow-hidden">
                <img src={store.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black text-premium border border-white/10">
                  <Star size={10} fill="currentColor" />
                  <span>{store.rating}</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">{store.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{store.category}</p>
                </div>
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ChevronRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Products Grid */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Todos os Produtos</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {ALL_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-card rounded-3xl overflow-hidden border border-white/5 shadow-standard flex flex-col group">
      <Link to={`/comercio/produto/${product.id}`} className="relative h-40 overflow-hidden shrink-0">
        <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
        <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase">
          Oferta
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/comercio/produto/${product.id}`}>
          <h4 className="font-black text-sm uppercase tracking-tight line-clamp-1 mb-1">{product.name}</h4>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">{product.store}</p>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-lg font-black text-foreground">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <button className="size-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg active:scale-90 transition-all">
            <Plus size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
