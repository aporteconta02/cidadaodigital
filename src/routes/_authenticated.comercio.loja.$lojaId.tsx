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
  Plus
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/comercio/loja/$lojaId")({
  component: LojaPage,
});

const STORE_MOCK = {
  id: '1',
  name: "Padaria do Sol",
  category: "Alimentação",
  rating: 4.8,
  reviews: 124,
  image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600",
  logo: "🥖",
  description: "A melhor padaria do bairro com pães artesanais e café fresco todos os dias.",
  address: "Rua das Flores, 123 - Jardim Paulista",
  phone: "(11) 98765-4321",
};

const STORE_PRODUCTS = [
  { id: '1', name: "Pão Francês Unit.", price: 0.80, image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=300" },
  { id: '4', name: "Bolo de Cenoura", price: 18.00, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300" },
  { id: '5', name: "Café Expresso", price: 6.50, image: "https://images.unsplash.com/photo-1510970174576-71d5009bc247?q=80&w=300" },
  { id: '6', name: "Pão de Queijo G", price: 4.50, image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=300" },
];

function LojaPage() {
  const { lojaId } = useParams({ from: '/_authenticated/comercio/loja/$lojaId' });
  const [activeTab, setActiveTab] = useState<'produtos' | 'sobre' | 'contato'>('produtos');

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Hero Banner */}
      <div className="relative h-64">
        <img src={STORE_MOCK.image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <Link 
          to="/comercio"
          className="absolute top-6 left-6 size-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
        >
          <ChevronLeft size={20} />
        </Link>
      </div>

      {/* Store Info Header */}
      <div className="px-6 -mt-16 relative z-10 text-center">
        <div className="size-24 bg-card rounded-3xl border-4 border-background shadow-standard flex items-center justify-center text-4xl mx-auto mb-4">
          {STORE_MOCK.logo}
        </div>
        <h1 className="text-3xl font-black font-display tracking-tighter uppercase mb-1">{STORE_MOCK.name}</h1>
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            {STORE_MOCK.category}
          </span>
          <div className="flex items-center gap-1 text-xs font-black text-premium">
            <Star size={12} fill="currentColor" />
            <span>{STORE_MOCK.rating}</span>
            <span className="text-muted-foreground font-bold">({STORE_MOCK.reviews})</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-card border border-white/5 rounded-2xl mb-8">
          <TabButton 
            active={activeTab === 'produtos'} 
            onClick={() => setActiveTab('produtos')} 
            icon={<Grid size={16} />} 
            label="Produtos" 
          />
          <TabButton 
            active={activeTab === 'sobre'} 
            onClick={() => setActiveTab('sobre')} 
            icon={<Info size={16} />} 
            label="Sobre" 
          />
          <TabButton 
            active={activeTab === 'contato'} 
            onClick={() => setActiveTab('contato')} 
            icon={<Phone size={16} />} 
            label="Contato" 
          />
        </div>

        {/* Content based on Tab */}
        <div className="text-left">
          {activeTab === 'produtos' && (
            <div className="grid grid-cols-2 gap-4">
              {STORE_PRODUCTS.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {activeTab === 'sobre' && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-standard">
              <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-3">Nossa História</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {STORE_MOCK.description}
              </p>
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                   <MapPin className="text-primary shrink-0" size={18} />
                   <span className="text-xs font-bold leading-normal">{STORE_MOCK.address}</span>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'contato' && (
            <div className="space-y-4">
              <a 
                href={`tel:${STORE_MOCK.phone}`}
                className="w-full flex items-center justify-between p-5 rounded-2xl bg-card border border-white/5 hover:bg-card-hover transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Telefone</h4>
                    <p className="font-bold text-sm">{STORE_MOCK.phone}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </a>
              <button className="w-full bg-secondary text-secondary-foreground font-black py-5 rounded-2xl shadow-standard text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                 Chamar no WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
        active ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StoreProductCard({ product }: { product: any }) {
  return (
    <div className="bg-card rounded-3xl overflow-hidden border border-white/5 shadow-standard flex flex-col group">
      <Link to={`/comercio/produto/${product.id}`} className="relative h-32 overflow-hidden shrink-0">
        <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="font-black text-xs uppercase tracking-tight line-clamp-1 mb-2">{product.name}</h4>
        <div className="mt-auto flex items-center justify-between gap-1">
          <span className="text-sm font-black text-foreground">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <button className="size-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg active:scale-90 transition-all">
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
