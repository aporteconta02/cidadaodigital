import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { 
  ChevronLeft, 
  ShoppingBag, 
  Store, 
  Minus, 
  Plus, 
  Heart,
  Share2,
  Star,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/comercio/produto/$produtoId")({
  component: ProdutoPage,
});

const PRODUCT_MOCK = {
  id: '1',
  name: "Bolo de Cenoura com Calda de Chocolate Belga",
  price: 18.00,
  originalPrice: 22.00,
  rating: 4.9,
  reviews: 42,
  description: "Bolo fofinho de cenoura com cobertura generosa de brigadeiro gourmet feito com chocolate belga 50%. Ideal para compartilhar (ou não!). Ingredientes frescos e produção artesanal diária.",
  image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800",
  store: {
    id: '1',
    name: "Padaria do Sol",
    category: "Alimentação",
    logo: "🥖"
  }
};

const MORE_FROM_STORE = [
  { id: '4', name: "Pão de Mel", price: 8.50, image: "https://images.unsplash.com/photo-1558961359-1d99283e094c?q=80&w=300" },
  { id: '5', name: "Donut Glaceado", price: 12.00, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=300" },
  { id: '6', name: "Brownie Vegano", price: 15.00, image: "https://images.unsplash.com/photo-1461009112044-3257f3c83462?q=80&w=300" },
];

function ProdutoPage() {
  const { produtoId } = useParams({ from: '/_authenticated/comercio/produto/$produtoId' });
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="pb-40 animate-in slide-in-from-bottom-20 duration-500 bg-bg-primary min-h-screen">
      {/* Product Image Hero */}
      <div className="relative h-[280px]">
        <img src={PRODUCT_MOCK.image} className="w-full h-full object-cover" alt={PRODUCT_MOCK.name} />
        
        {/* Fixed controls on image */}
        <div className="absolute top-6 left-4 flex items-center gap-2">
          <Link 
            to="/comercio"
            className="size-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
        </div>

        <div className="absolute top-6 right-4 flex items-center gap-2">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="size-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <Heart size={20} className={cn(isLiked && "fill-sos text-sos")} />
          </button>
          <button className="size-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="px-5 pt-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary leading-tight mb-2">
            {PRODUCT_MOCK.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 text-sm font-bold text-gold">
              <Star size={14} fill="currentColor" />
              <span>{PRODUCT_MOCK.rating}</span>
              <span className="text-text-muted font-normal ml-1">({PRODUCT_MOCK.reviews} avaliações)</span>
            </div>
          </div>

          <Link 
            to={`/comercio/loja/${PRODUCT_MOCK.store.id}`}
            className="flex items-center justify-between p-4 rounded-md bg-bg-card border border-white/5 group active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-bg-elevated flex items-center justify-center text-xl shadow-card">
                {PRODUCT_MOCK.store.logo}
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">{PRODUCT_MOCK.store.name}</h4>
                <p className="micro-text text-text-muted uppercase tracking-widest">{PRODUCT_MOCK.store.category}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-muted group-hover:text-primary" />
          </Link>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-2">Descrição</h3>
          <p className="body-text text-text-secondary leading-relaxed">
            {PRODUCT_MOCK.description}
          </p>
        </div>

        {/* Mais desta loja */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">Mais desta loja</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {MORE_FROM_STORE.map((item) => (
              <div key={item.id} className="flex-[0_0_140px] flex flex-col gap-2 group cursor-pointer">
                <div className="relative aspect-square rounded-md overflow-hidden bg-bg-card border border-white/5">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div>
                  <h4 className="text-[12px] font-semibold text-text-primary truncate">{item.name}</h4>
                  <span className="text-sm font-bold text-primary">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-2xl border-t border-white/5 p-4 safe-area-bottom">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          {/* Quantity Selector */}
          <div className="flex items-center gap-4 bg-[#1A1A24] rounded-md px-2 py-2 border border-white/5 shrink-0">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="size-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-primary active:scale-90 transition-all border border-white/5"
            >
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold w-4 text-center text-text-primary">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="size-8 rounded-full bg-bg-elevated flex items-center justify-center text-primary active:scale-90 transition-all border border-white/5"
            >
              <Plus size={16} />
            </button>
          </div>

          <button className="flex-1 bg-secondary text-text-primary font-bold h-[52px] rounded-md shadow-[0_8px_24px_rgba(255,107,53,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
             <span>Adicionar</span>
             <span className="opacity-40">•</span>
             <span>R$ {(PRODUCT_MOCK.price * quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
