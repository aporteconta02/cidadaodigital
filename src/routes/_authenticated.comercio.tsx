import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star, ChevronRight, Plus, MapPin, Filter, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

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

const BANNERS = [
  { id: 1, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600", title: "Festival de Pizza" },
  { id: 2, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600", title: "Pratos Saudáveis" },
  { id: 3, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600", title: "Massas Artesanais" },
];

const FEATURED_STORES = [
  { 
    id: '1', 
    name: "Burger King", 
    category: "Lanches", 
    rating: 4.8, 
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=400",
    logo: "🍔",
    time: "25-40 min",
    isPremium: true
  },
  { 
    id: '2', 
    name: "Petz", 
    category: "Pet Shop", 
    rating: 4.9, 
    image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=400",
    logo: "🐾",
    time: "15-25 min",
    isPremium: false
  },
  { 
    id: '3', 
    name: "Farmácia Silva", 
    category: "Saúde", 
    rating: 4.7, 
    image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400",
    logo: "💊",
    time: "20-30 min",
    isPremium: true
  },
];

const ALL_PRODUCTS = [
  { id: '1', name: "X-Bacon Especial", price: 29.90, originalPrice: 39.90, store: "Burger King", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=300" },
  { id: '2', name: "Ração Premium 1kg", price: 45.90, store: "Petz", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300" },
  { id: '3', name: "Bolo de Cenoura", price: 18.00, originalPrice: 22.00, store: "Padaria Sol", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300" },
  { id: '4', name: "Pizza Calabresa", price: 34.90, store: "Pizza Hut", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300" },
];

function ComercioPage() {
  const [activeCategory, setActiveCategory] = useState("Comida");
  const [deliveryType, setDeliveryType] = useState<'entrega' | 'retirada'>('entrega');

  return (
    <div className="pb-32 animate-in fade-in duration-500 bg-bg-primary">
      {/* Header do Marketplace */}
      <header className="px-4 pt-4 mb-4">
        <div className="flex flex-col gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
            <input 
              placeholder="Buscar produtos ou lojas..." 
              className="w-full bg-[#1A1A24] border border-white/5 rounded-md py-3.5 pl-12 pr-4 text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex bg-[#1A1A24] p-1 rounded-full border border-white/5">
              <button 
                onClick={() => setDeliveryType('entrega')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                  deliveryType === 'entrega' ? "bg-primary text-text-primary" : "text-text-secondary"
                )}
              >
                Entrega
              </button>
              <button 
                onClick={() => setDeliveryType('retirada')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                  deliveryType === 'retirada' ? "bg-primary text-text-primary" : "text-text-secondary"
                )}
              >
                Retirada
              </button>
            </div>
            
            <button className="flex items-center gap-1.5 text-text-secondary">
              <MapPin size={14} className="text-secondary" />
              <span className="micro-text font-bold uppercase tracking-wider truncate max-w-[120px]">Palmital</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Categorias */}
      <section className="mb-6 overflow-hidden">
        <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.label)}
              className={cn(
                "whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2",
                activeCategory === cat.label 
                  ? "bg-primary border-primary text-text-primary shadow-glow" 
                  : "bg-[#1A1A24] border-white/5 text-text-secondary"
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Banner Promoções */}
      <section className="px-4 mb-8">
        <Carousel 
          opts={{ loop: true }} 
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full"
        >
          <CarouselContent>
            {BANNERS.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="h-[130px] w-full rounded-md relative overflow-hidden shadow-card">
                  <img src={banner.image} className="w-full h-full object-cover" alt={banner.title} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-6">
                    <h3 className="hero-title text-text-primary text-xl">{banner.title}</h3>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Lojas em Destaque */}
      <section className="mb-8">
        <div className="px-4 flex items-center justify-between mb-4">
          <h2 className="section-title uppercase tracking-tighter">Lojas em Destaque</h2>
          <button className="micro-text font-bold text-primary uppercase tracking-widest">Ver tudo</button>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-2">
          {FEATURED_STORES.map((store) => (
            <Link 
              key={store.id} 
              to={`/comercio/loja/${store.id}`}
              className="flex-[0_0_200px] group active:scale-[0.98] transition-all"
            >
              <div className="relative h-[100px] rounded-t-md overflow-hidden">
                <img src={store.image} className="w-full h-full object-cover" alt={store.name} />
                {store.isPremium && (
                  <div className="absolute top-2 right-2 bg-secondary text-text-primary micro-text font-black px-2 py-0.5 rounded-full shadow-card">
                    DESTAQUE
                  </div>
                )}
              </div>
              <div className="bg-bg-card rounded-b-md p-3 relative pt-6 border-x border-b border-white/5">
                <div className="absolute -top-5 left-3 size-10 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center text-xl shadow-card">
                  {store.logo}
                </div>
                <h4 className="text-sm font-bold text-text-primary truncate">{store.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5 text-xs font-bold text-gold">
                    <Star size={10} fill="currentColor" />
                    <span>{store.rating}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">• {store.category}</span>
                </div>
                <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                  🛵 <span className="font-medium">Entrega • {store.time}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Todos os Produtos */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title uppercase tracking-tighter">Todos os Produtos</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {ALL_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Cart Quick Access Trigger */}
      <div className="fixed bottom-[88px] right-4 z-40">
        <Drawer>
          <DrawerTrigger asChild>
            <button className="size-14 rounded-full bg-secondary text-text-primary flex items-center justify-center shadow-[0_8px_24px_rgba(255,107,53,0.4)] active:scale-90 transition-all cursor-pointer">
              <ShoppingBag size={24} />
              <div className="absolute -top-1 -right-1 size-6 bg-text-primary text-secondary rounded-full flex items-center justify-center text-xs font-black border-2 border-secondary">
                2
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-bg-elevated border-border-custom max-w-lg mx-auto rounded-t-3xl">
            <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-white/10" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary uppercase tracking-tight">Seu Carrinho</h3>
                <span className="micro-text font-bold text-text-muted uppercase">2 itens</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <CartItem name="X-Bacon Especial" store="Burger King" price={29.90} qty={1} />
                <CartItem name="Whopper Especial" store="Burger King" price={34.90} qty={1} />
              </div>

              <div className="space-y-3 p-4 rounded-md bg-white/5 border border-white/5 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary font-bold">R$ 64,80</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Entrega</span>
                  <span className="text-primary font-bold">R$ 5,90</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between text-lg">
                  <span className="text-text-primary font-bold">Total</span>
                  <span className="text-secondary font-black">R$ 70,70</span>
                </div>
              </div>

              <button className="w-full bg-secondary text-text-primary font-bold h-[56px] rounded-md shadow-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4">
                Finalizar pedido • R$ 70,70
              </button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-bg-card rounded-md overflow-hidden border border-white/5 shadow-card flex flex-col group active:scale-[0.98] transition-all">
      <Link to={`/comercio/produto/${product.id}`} className="relative aspect-square overflow-hidden shrink-0">
        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-danger text-text-primary text-[9px] font-black px-2 py-0.5 rounded-full shadow-card uppercase">
            Promo
          </div>
        )}
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link to={`/comercio/produto/${product.id}`}>
          <h4 className="text-[13px] font-semibold text-text-primary line-clamp-2 leading-tight mb-0.5">{product.name}</h4>
          <p className="micro-text text-text-muted font-bold uppercase tracking-widest mb-2">{product.store}</p>
        </Link>
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-text-muted line-through">R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            )}
            <span className="text-base font-bold text-primary">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button className="size-8 rounded-full bg-secondary text-text-primary flex items-center justify-center shadow-[0_4px_12px_rgba(255,107,53,0.4)] active:scale-90 transition-all">
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CartItem({ name, store, price, qty }: { name: string; store: string; price: number; qty: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-md bg-bg-elevated border border-white/5" />
        <div>
          <h4 className="text-sm font-bold text-text-primary">{name}</h4>
          <p className="micro-text text-text-muted uppercase tracking-widest">{store}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-text-primary">R$ {(price * qty).toFixed(2)}</span>
        <span className="micro-text text-text-muted">{qty}x R$ {price.toFixed(2)}</span>
      </div>
    </div>
  );
}
