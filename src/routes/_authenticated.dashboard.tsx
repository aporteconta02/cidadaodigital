import { createFileRoute } from "@tanstack/react-router";
import { 
  ShoppingBag, 
  Megaphone, 
  Calendar, 
  ShieldCheck, 
  MessageSquare, 
  ClipboardList, 
  Star, 
  Phone,
  Flame,
  ChevronRight,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const STORIES = [
  { id: 'city', label: 'Cidade', icon: '🏙️', official: true },
  { id: 'event1', label: 'Evento', icon: '🎉' },
  { id: 'alert1', label: 'Alerta', icon: '⚠️' },
  { id: 'club1', label: 'Clube', icon: '⭐' },
  { id: 'event2', label: 'Show', icon: '🎸' },
  { id: 'alert2', label: 'Obras', icon: '🚧' },
];

const HERO_BANNERS = [
  { id: 1, title: 'Clube Cidadão+', desc: 'Descontos exclusivos em toda a cidade', color: 'bg-gradient-hero' },
  { id: 2, title: 'Evento da Semana', desc: 'Feira Gastronômica no Centro', color: 'bg-gradient-card' },
  { id: 3, title: 'Voz do Povo', desc: 'Participe da nova pesquisa ativa', color: 'bg-gradient-gold' },
];

const QUICK_ACCESS = [
  { label: "Mercado", icon: <ShoppingBag size={28} />, color: "text-primary" },
  { label: "Denúncia", icon: <Megaphone size={28} />, color: "text-secondary" },
  { label: "Eventos", icon: <Calendar size={28} />, color: "text-success" },
  { label: "Seguro", icon: <ShieldCheck size={28} />, color: "text-primary" },
  { label: "Voz do Povo", icon: <MessageSquare size={28} />, color: "text-secondary" },
  { label: "Mural", icon: <ClipboardList size={28} />, color: "text-success" },
  { label: "Benefícios", icon: <Star size={28} />, color: "text-gold" },
  { label: "Telefones", icon: <Phone size={28} />, color: "text-text-secondary" },
];

const TRENDING_EVENTS = [
  { id: 1, title: "Feira de Orgânicos", date: "Sáb, 08:00", category: "Social", color: "bg-success" },
  { id: 2, title: "Show na Praça", date: "Dom, 19:00", category: "Cultura", color: "bg-primary" },
  { id: 3, title: "Mutirão Limpeza", date: "Seg, 07:00", category: "Cidade", color: "bg-secondary" },
];

const CLUB_OFFERS = [
  { id: 1, name: "Pizzaria Local", discount: "20%", blur: false },
  { id: 2, name: "Farmácia Silva", discount: "15%", blur: true },
  { id: 3, name: "Mercado Central", discount: "10%", blur: true },
];

function DashboardPage() {
  const { profile } = Route.useRouteContext();
  const [user, setUser] = useState<any>(profile);
  const [loading, setLoading] = useState(!profile);
  const isSubscriber = user?.assinante_plus || false;

  useEffect(() => {
    let isMounted = true;
    if (!profile) {
      const checkProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          const { data } = await supabase.from('usuarios').select('*').eq('auth_id', session.user.id).maybeSingle();
          if (data && isMounted) setUser(data);
        }
        if (isMounted) setLoading(false);
      };
      checkProfile();
    }
    return () => { isMounted = false; };
  }, [profile]);

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current"></div>
        <p className="micro-text uppercase tracking-widest animate-pulse font-jakarta">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-in fade-in duration-700 bg-bg-primary min-h-screen">
      
      {/* Stories Bar */}
      <section className="py-6 overflow-hidden">
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar">
          {STORIES.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-2 shrink-0">
              <div className="size-[68px] rounded-full p-[2px] bg-gradient-hero animate-pulse">
                <div className="size-full rounded-full bg-bg-primary p-[2px]">
                  <div className="size-full rounded-full bg-bg-card flex items-center justify-center text-2xl border border-white/5 shadow-card">
                    {story.icon}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-text-secondary">{story.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hero Banner Carousel */}
      <section className="px-4 mb-8">
        <Carousel 
          opts={{ loop: true }} 
          plugins={[Autoplay({ delay: 4000 })]}
          className="w-full"
        >
          <CarouselContent>
            {HERO_BANNERS.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className={cn("h-[180px] w-full rounded-lg p-6 relative overflow-hidden group shadow-card", banner.color)}>
                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <h3 className="hero-title text-text-primary mb-1">{banner.title}</h3>
                    <p className="body-text text-text-primary/80">{banner.desc}</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Star size={120} />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Quick Access Grid */}
      <section className="px-4 mb-10">
        <h2 className="section-title mb-4 uppercase tracking-tighter">Acesso Rápido</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACCESS.map((item, idx) => (
            <button key={idx} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
              <div className="size-[72px] rounded-lg glass flex items-center justify-center shadow-card group-hover:bg-white/10 transition-colors">
                <div className={item.color}>{item.icon}</div>
              </div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter text-center leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Events */}
      <section className="mb-10">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="section-title uppercase tracking-tighter flex items-center gap-2">
            🔥 Em Alta
          </h2>
          <button className="micro-text font-bold text-primary uppercase tracking-widest hover:underline">Ver tudo</button>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-4">
          {TRENDING_EVENTS.map((event) => (
            <motion.div 
              key={event.id}
              whileTap={{ scale: 0.98 }}
              className="min-w-[160px] h-[200px] rounded-lg bg-bg-card border border-white/5 overflow-hidden shadow-card flex flex-col group cursor-pointer"
            >
              <div className="h-24 bg-white/5 relative">
                <div className={cn("absolute top-2 left-2 px-2 py-0.5 rounded-full micro-text font-bold text-white uppercase", event.color)}>
                  {event.category}
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h4 className="card-title text-text-primary line-clamp-2 leading-tight">{event.title}</h4>
                <p className="caption-text text-text-muted">{event.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Voz do Povo Special Card */}
      <section className="px-4 mb-10">
        <div className="bg-gradient-hero/10 border border-primary/20 rounded-lg p-6 relative overflow-hidden glass">
          <div className="relative z-10">
            <h3 className="section-title text-text-primary mb-2 uppercase italic">Voz do Povo</h3>
            <p className="caption-text text-text-secondary mb-4">Novo asfalto no bairro: Qual sua prioridade?</p>
            
            <div className="w-full h-2 bg-white/5 rounded-full mb-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
            
            <button className="w-full bg-primary text-text-primary py-3 rounded-md font-bold uppercase tracking-widest text-xs shadow-glow active:scale-[0.98] transition-all">
              Votar agora
            </button>
          </div>
        </div>
      </section>

      {/* Clube Cidadão+ Offers */}
      <section className="mb-10">
        <div className="px-4 mb-4">
          <h2 className="section-title uppercase tracking-tighter flex items-center gap-2">
            ⭐ Clube Cidadão+
          </h2>
        </div>
        <div className="flex gap-4 px-4 overflow-x-auto no-scrollbar pb-4">
          {CLUB_OFFERS.map((offer) => (
            <div 
              key={offer.id} 
              className={cn(
                "min-w-[200px] h-[120px] rounded-lg p-4 flex flex-col justify-between relative overflow-hidden glass border border-white/5",
                offer.blur && !isSubscriber && "overflow-hidden"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="px-2 py-1 rounded-full bg-gradient-gold text-[10px] font-black text-bg-primary uppercase shadow-card">
                  {offer.discount} OFF
                </div>
                <Star className="text-gold" size={16} />
              </div>
              
              <h4 className="card-title text-text-primary">{offer.name}</h4>
              
              {offer.blur && !isSubscriber && (
                <div className="absolute inset-0 bg-bg-card/40 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                  <span className="micro-text font-black text-text-primary uppercase tracking-widest mb-2">Assine para ver</span>
                  <button className="text-[9px] font-bold text-primary uppercase underline">Desbloquear</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}