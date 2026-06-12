import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { 
  ChevronLeft, 
  ChevronRight,
  Star, 
  MapPin, 
  Phone, 
  Info, 
  Grid, 
  ShoppingBag,
  Plus,
  Clock,
  Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/comercio/loja/$lojaId")({
  component: LojaPage,
});

const STORE_MOCK = {
  id: '1',
  name: "Burger King",
  category: "Lanches",
  rating: 4.8,
  reviews: 124,
  image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800",
  logo: "🍔",
  description: "Os melhores hambúrgueres grelhados no fogo direto para você.",
  address: "Rua do Comércio, 456 - Palmital",
  phone: "(31) 98888-7777",
  time: "25-40 min",
  deliveryFee: 5.90
};

const CATEGORIES = [
  { id: '1', name: "Mais Pedidos" },
  { id: '2', name: "Promoções" },
  { id: '3', name: "Cardápio Completo" },
];

const STORE_PRODUCTS = [
  { id: '1', name: "Whopper Especial", price: 29.90, originalPrice: 34.90, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=300" },
  { id: '2', name: "Batata Frita G", price: 12.90, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=300" },
  { id: '3', name: "Combo Casal", price: 54.90, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=300" },
  { id: '4', name: "Milkshake Chocolate", price: 15.00, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300" },
];

function LojaPage() {
  const { lojaId } = useParams({ from: '/_authenticated/comercio/loja/$lojaId' });
  const [activeTab, setActiveTab] = useState('Mais Pedidos');

  return (
    <div className="pb-32 animate-in fade-in duration-500 bg-bg-primary min-h-screen">
      {/* Banner da Loja */}
      <div className="relative h-[200px]">
        <img src={STORE_MOCK.image} className="w-full h-full object-cover" alt={STORE_MOCK.name} />
        <div className="absolute inset-0 bg-black/40" />
        
        <Link 
          to="/comercio"
          className="absolute top-6 left-4 size-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} />
        </Link>
      </div>

      {/* Header Info Sobreposto */}
      <div className="px-4 -mt-12 relative z-10 mb-6">
        <div className="bg-bg-card rounded-md p-5 border border-white/5 shadow-card flex flex-col items-center text-center glass">
          <div className="size-20 bg-bg-elevated rounded-full border-4 border-bg-card shadow-card flex items-center justify-center text-4xl -mt-16 mb-3">
            {STORE_MOCK.logo}
          </div>
          <h1 className="text-xl font-bold text-text-primary uppercase tracking-tight mb-1">{STORE_MOCK.name}</h1>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-xs font-bold text-gold">
              <Star size={14} fill="currentColor" />
              <span>{STORE_MOCK.rating}</span>
            </div>
            <span className="text-text-muted">•</span>
            <div className="flex items-center gap-1 text-xs font-bold text-text-secondary">
              <Clock size={14} />
              <span>{STORE_MOCK.time}</span>
            </div>
            <span className="text-text-muted">•</span>
            <span className="text-xs font-bold text-text-secondary">Frete R$ {STORE_MOCK.deliveryFee.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tabs Sticky */}
      <div className="sticky top-[80px] z-30 bg-bg-primary/95 backdrop-blur-md border-y border-white/5 overflow-hidden">
        <div className="flex gap-6 px-4 overflow-x-auto no-scrollbar py-4">
          {CATEGORIES.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                "whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all relative pb-1",
                activeTab === tab.name ? "text-primary" : "text-text-muted"
              )}
            >
              {tab.name}
              {activeTab === tab.name && (
                <motion.div layoutId="tab-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Busca na Loja */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input 
            placeholder="Buscar no cardápio..." 
            className="w-full bg-[#1A1A24] border border-white/5 rounded-md py-3 pl-11 pr-4 text-sm font-medium text-text-primary"
          />
        </div>
      </div>

      {/* Grid de Produtos */}
      <section className="px-4">
        <h2 className="section-title mb-4 uppercase tracking-tighter">{activeTab}</h2>
        <div className="grid grid-cols-2 gap-4">
          {STORE_PRODUCTS.map((product) => (
            <div key={product.id} className="bg-bg-card rounded-md overflow-hidden border border-white/5 shadow-card flex flex-col active:scale-[0.98] transition-all">
              <Link to={`/comercio/produto/${product.id}`} className="relative aspect-square overflow-hidden shrink-0">
                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
              </Link>
              <div className="p-3 flex-1 flex flex-col">
                <h4 className="text-[12px] font-semibold text-text-primary line-clamp-2 leading-tight mb-1">{product.name}</h4>
                <div className="mt-auto flex items-end justify-between">
                  <span className="text-sm font-bold text-primary">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button className="size-8 rounded-full bg-secondary text-text-primary flex items-center justify-center shadow-card active:scale-90 transition-all">
                    <Plus size={16} strokeWidth={3} />
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
