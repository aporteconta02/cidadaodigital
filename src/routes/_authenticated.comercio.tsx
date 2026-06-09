import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag, Star, Zap, ChevronRight, Store } from "lucide-react";

export const Route = createFileRoute("/_authenticated/comercio")({
  component: ComercioPage,
});

function ComercioPage() {
  const categories = ["Todos", "Mercado", "Padaria", "Pet Shop", "Saúde"];
  
  return (
    <div className="p-6 space-y-6 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black font-display tracking-tight uppercase">Comércio Local</h2>
        <button className="text-primary font-bold text-xs uppercase tracking-widest">Ver Mapa</button>
      </div>

      {/* Horizontal categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Promotions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-secondary">
          <Zap size={16} fill="currentColor" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Ofertas Relâmpago</h3>
        </div>
        
        <div className="bg-gradient-to-r from-secondary/20 to-transparent border border-secondary/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="size-12 rounded-lg bg-card flex items-center justify-center text-2xl border border-secondary/50">🥖</div>
            <div>
              <h4 className="font-bold text-sm">Pão Quentinho</h4>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Padaria Pão de Mel</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs line-through text-muted-foreground">R$ 1,50</p>
            <p className="text-lg font-black text-secondary">R$ 0,80</p>
          </div>
        </div>
      </div>

      {/* Local Stores List */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Lojas Recomendadas</h3>
        {[
          { name: "Pet Shop Auau", type: "Pet", rating: "4.9", dist: "450m", icon: "🐾" },
          { name: "Drogaria Bairro", type: "Saúde", rating: "4.7", dist: "800m", icon: "💊" },
          { name: "Mercado do Zé", type: "Mercado", rating: "4.5", dist: "200m", icon: "🛒" },
        ].map((store, i) => (
          <div key={i} className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border hover:bg-card-hover transition-colors">
            <div className="size-12 rounded-xl bg-background flex items-center justify-center text-2xl border border-border shadow-inner">
              {store.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{store.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{store.type}</span>
                <div className="flex items-center gap-1 text-[10px] text-premium font-bold">
                  <Star size={10} fill="currentColor" />
                  <span>{store.rating}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold">{store.dist}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}
