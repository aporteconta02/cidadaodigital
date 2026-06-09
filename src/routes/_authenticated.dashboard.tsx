import { createFileRoute } from "@tanstack/react-router";
import { 
  Search, 
  MapPin, 
  AlertCircle, 
  ShoppingBasket, 
  Bell, 
  Megaphone, 
  Calendar, 
  ShieldCheck, 
  ClipboardList, 
  Phone,
  ChevronRight,
  TrendingUp,
  Star,
  Users
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from 'embla-carousel-autoplay';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const BANNERS = [
  { id: 1, image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop", title: "Festival Gastronômico", subtitle: "Neste final de semana na Praça Central" },
  { id: 2, image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=600&auto=format&fit=crop", title: "Apoie o Comércio Local", subtitle: "Ganhe pontos em dobro nas compras no bairro" },
  { id: 3, image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop", title: "Mutirão de Limpeza", subtitle: "Junte-se aos vizinhos no próximo sábado" },
];

const QUICK_ACTIONS = [
  { id: 'market', icon: <ShoppingBasket size={24} />, label: "Marketplace", color: "text-secondary" },
  { id: 'denuncia', icon: <Megaphone size={24} />, label: "Denúncia", color: "text-sos" },
  { id: 'eventos', icon: <Calendar size={24} />, label: "Eventos", color: "text-primary" },
  { id: 'seguro', icon: <ShieldCheck size={24} />, label: "Vizinho Seguro", color: "text-secondary" },
  { id: 'mural', icon: <ClipboardList size={24} />, label: "Mural", color: "text-premium" },
  { id: 'telefones', icon: <Phone size={24} />, label: "Telefones", color: "text-primary" },
];

function DashboardPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Mock data for sections
  const isSubscriber = true; // Temporary mock

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      {/* Search & Header (Header is already in __root but we add search here as per layout) */}
      <div className="px-6 pt-4 mb-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input 
            placeholder="Buscar serviços, ocorrências..." 
            className="w-full bg-card border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all shadow-standard"
          />
        </div>
      </div>

      {/* Rotating Banners */}
      <section className="mb-8 relative group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {BANNERS.map((banner) => (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-48 px-6">
                <div className="w-full h-full rounded-3xl overflow-hidden relative border border-white/5 shadow-standard">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-white font-black font-display text-xl leading-none mb-1 uppercase tracking-tight">{banner.title}</h3>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{banner.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Pagination Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {BANNERS.map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="px-6 mb-10">
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button 
              key={action.id} 
              className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-card border border-white/5 hover:bg-card-hover hover:border-white/10 transition-all shadow-standard active:scale-95 group"
            >
              <div className={cn("transition-transform group-hover:scale-110", action.color)}>
                {action.icon}
              </div>
              <span className="text-[10px] font-black font-display uppercase tracking-widest text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="mb-10">
        <div className="px-6 flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Eventos em Destaque</h2>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary">Ver todos</button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
          {[
            { title: "Yoga no Parque", date: "Dom, 08:00", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300" },
            { title: "Feira de Adoção", date: "Sáb, 10:00", img: "https://images.unsplash.com/photo-1548199973-03c40e556509?q=80&w=300" },
            { title: "Cinema de Rua", date: "Sex, 19:30", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300" },
          ].map((event, i) => (
            <div key={i} className="flex-[0_0_160px] bg-card rounded-2xl overflow-hidden border border-white/5 shadow-standard">
              <img src={event.img} className="w-full h-24 object-cover" />
              <div className="p-3">
                <h4 className="font-bold text-xs truncate mb-1">{event.title}</h4>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-black uppercase tracking-tight">
                  <Calendar size={10} />
                  <span>{event.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Neighborhood Alerts (Subscribers only) */}
      {isSubscriber && (
        <section className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-sos flex items-center gap-2">
              <AlertCircle size={16} />
              Alertas do Bairro
            </h2>
            <span className="text-[9px] font-black uppercase bg-premium/10 text-premium px-2 py-0.5 rounded border border-premium/20">Plus</span>
          </div>
          <div className="space-y-3">
            {[
              { type: "Suspeito", time: "Há 5 min", loc: "Rua Oscar Freire" },
              { type: "Acidente", time: "Há 12 min", loc: "Av. Brasil" },
              { type: "Barulho", time: "Há 45 min", loc: "Praça das Flores" },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-sos/5 border border-sos/10 hover:bg-sos/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-sos/20 flex items-center justify-center text-sos">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{alert.type}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{alert.loc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-sos/60 uppercase">{alert.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Voz do Povo (Poll) */}
      <section className="px-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Users size={16} />
            Voz do Povo
          </h2>
        </div>
        <div className="bg-card border border-white/5 rounded-3xl p-6 shadow-standard relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <TrendingUp size={100} />
          </div>
          <h3 className="text-lg font-black font-display leading-tight mb-4 uppercase tracking-tight relative z-10">
            Qual a prioridade para o bairro em 2026?
          </h3>
          <div className="space-y-4 relative z-10">
            <PollOption label="Iluminação" percent={65} active />
            <PollOption label="Asfaltamento" percent={20} />
            <PollOption label="Novas Praças" percent={15} />
          </div>
          <p className="mt-6 text-[10px] text-muted-foreground font-bold text-center uppercase tracking-widest">
            842 vizinhos já votaram
          </p>
        </div>
      </section>

      {/* Clube de Benefícios */}
      {isSubscriber && (
        <section className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-secondary flex items-center gap-2">
              <Star size={16} />
              Ofertas do Clube
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { store: "Padaria Real", off: "15%", img: "🥖" },
              { store: "Pet Shop", off: "10%", img: "🐾" },
              { store: "Farmácia", off: "20%", img: "💊" },
            ].map((offer, i) => (
              <div key={i} className="bg-card border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center shadow-standard hover:bg-card-hover transition-colors">
                <div className="text-2xl mb-2">{offer.img}</div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">{offer.store}</h4>
                <span className="text-sm font-black text-secondary">{offer.off} OFF</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary text-xs font-black uppercase tracking-widest hover:bg-secondary/20 transition-all flex items-center justify-center gap-2">
            Ver Clube Completo
            <ChevronRight size={14} />
          </button>
        </section>
      )}
    </div>
  );
}

function PollOption({ label, percent, active = false }: { label: string, percent: number, active?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", active ? "bg-primary" : "bg-muted-foreground/30")}
        />
      </div>
    </div>
  );
}
