import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { 
  ChevronLeft, 
  ShoppingBag, 
  Store, 
  Minus, 
  Plus, 
  Heart,
  Share2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/comercio/produto/$produtoId")({
  component: ProdutoPage,
});

const PRODUCT_MOCK = {
  id: '1',
  name: "Bolo de Cenoura com Calda de Chocolate Belga",
  price: 18.00,
  description: "Bolo fofinho de cenoura com cobertura generosa de brigadeiro gourmet feito com chocolate belga 50%. Ideal para compartilhar (ou não!). Ingredientes frescos e produção artesanal diária.",
  image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800",
  store: {
    id: '1',
    name: "Padaria do Sol",
    category: "Alimentação",
    logo: "🥖"
  }
};

function ProdutoPage() {
  const { produtoId } = useParams({ from: '/_authenticated/comercio/produto/$produtoId' });
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="pb-32 animate-in slide-in-from-bottom-20 duration-500">
      {/* Product Image Header */}
      <div className="relative h-96">
        <img src={PRODUCT_MOCK.image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        
        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Link 
            to="/comercio"
            className="size-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "size-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-90",
                isLiked ? "text-sos" : "text-white"
              )}
            >
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button className="size-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-8 -mt-10 relative z-10 bg-background rounded-t-[40px] pt-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
             <h1 className="text-3xl font-black font-display tracking-tighter leading-tight uppercase mb-2">
              {PRODUCT_MOCK.name}
            </h1>
            <Link 
              to={`/comercio/loja/${PRODUCT_MOCK.store.id}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-white/5 hover:bg-card-hover transition-colors group"
            >
              <span className="text-lg">{PRODUCT_MOCK.store.logo}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                {PRODUCT_MOCK.store.name}
              </span>
            </Link>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-foreground">
              R$ {PRODUCT_MOCK.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-10">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-3">Descrição</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {PRODUCT_MOCK.description}
          </p>
        </div>

        {/* Quantity & Action */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-card border border-white/5 rounded-2xl p-2">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="size-10 rounded-xl bg-background border border-white/5 flex items-center justify-center text-muted-foreground active:scale-90 transition-all"
            >
              <Minus size={18} />
            </button>
            <span className="text-lg font-black w-8 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="size-10 rounded-xl bg-background border border-white/5 flex items-center justify-center text-primary active:scale-90 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>

          <button className="flex-1 bg-secondary text-secondary-foreground font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(0,232,122,0.3)] text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3">
             <ShoppingBag size={20} />
             Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
