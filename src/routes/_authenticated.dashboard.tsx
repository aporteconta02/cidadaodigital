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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


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
  const { profile } = Route.useRouteContext();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [user, setUser] = useState<any>(profile);
  const [isSubscriber, setIsSubscriber] = useState(!!profile?.assinante_plus);
  const [loading, setLoading] = useState(false); // Change: don't start as loading if we already have context

  useEffect(() => {
    if (profile) {
      setUser(profile);
      setIsSubscriber(!!profile.assinante_plus);
      setLoading(false);
    } else {
      // If profile is missing in context, it might be loading or truly missing
      // We can try to fetch it here as a fallback
      const checkProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase.from('usuarios').select('*').eq('auth_id', session.user.id).maybeSingle();
          if (data) {
            setUser(data);
            setIsSubscriber(!!data.assinante_plus);
          }
        }
        setLoading(false);
      };
      checkProfile();
    }
  }, [profile]);


  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (loading) {

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current"></div>
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Carregando Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-in fade-in duration-700">

      {/* Search & Header */}
      <div className="px-6 pt-6 mb-8">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300" size={18} />
          <input 
            placeholder="O que você procura hoje?" 
            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-5 pl-12 pr-5 text-sm font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:bg-white/[0.05] transition-all duration-500 shadow-soft"
          />
        </div>
      </div>

      {/* Hero Carousel */}
      <section className="mb-10 relative group">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {BANNERS.map((banner) => (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0 relative h-56 px-6">
                <div className="w-full h-full rounded-[32px] overflow-hidden relative border border-white/[0.05] shadow-premium group/card">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="text-white font-bold font-display text-2xl leading-tight mb-2 uppercase tracking-tight italic">{banner.title}</h3>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{banner.subtitle}</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Modern Pagination */}
        <div className="flex justify-center gap-1.5 mt-5">
          {BANNERS.map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-0.5 rounded-full transition-all duration-500",
                i === selectedIndex ? "w-8 bg-primary" : "w-2 bg-white/10"
              )}
            />
          ))}
        </div>
      </section>

      {/* Action Grid (Bento Style Lite) */}
      <section className="px-6 mb-12">
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action, idx) => (
            <motion.button 
              key={action.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-500 shadow-soft active:scale-95 group"
            >
              <div className={cn("transition-transform duration-500 group-hover:scale-110", action.color)}>
                {action.icon}
              </div>
              <span className="text-[9px] font-black font-display uppercase tracking-[0.15em] text-center leading-tight opacity-60 group-hover:opacity-100 transition-opacity">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Event Cards */}
      <section className="mb-12">
        <div className="px-6 flex items-center justify-between mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Próximos Eventos</h2>
          <button className="text-[9px] font-black uppercase tracking-[0.1em] text-primary hover:underline">Ver Agenda</button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-6 scrollbar-hide">
          {[
            { title: "Yoga no Parque", date: "DOMINGO, 08:00", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300" },
            { title: "Feira de Adoção", date: "SÁBADO, 10:00", img: "https://images.unsplash.com/photo-1548199973-03c40e556509?q=80&w=300" },
            { title: "Cinema de Rua", date: "SEXTA, 19:30", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300" },
          ].map((event, i) => (
            <div key={i} className="flex-[0_0_200px] bg-white/[0.02] rounded-[24px] overflow-hidden border border-white/[0.04] shadow-premium hover:bg-white/[0.04] transition-all duration-500 group">
              <div className="h-28 overflow-hidden">
                <img src={event.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-sm mb-1 text-foreground/90 uppercase tracking-tight italic">{event.title}</h4>
                <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                  <Calendar size={10} className="text-primary" />
                  <span>{event.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Neighborhood Alerts (Subscribers only) */}
      {isSubscriber && (
        <section className="px-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-sos flex items-center gap-2">
              <AlertCircle size={14} />
              Alertas Recentes
            </h2>
            <span className="text-[8px] font-black uppercase bg-premium text-black px-2 py-0.5 rounded-full">C+ PREMIUM</span>
          </div>
          <div className="space-y-4">
            {[
              { type: "Comportamento Suspeito", time: "HÁ 5 MINUTOS", loc: "Rua Oscar Freire, 1200" },
              { type: "Acidente de Trânsito", time: "HÁ 12 MINUTOS", loc: "Av. Brasil x Rebouças" },
            ].map((alert, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-sos/5 border border-sos/10 hover:bg-sos/10 transition-all duration-500 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-11 rounded-2xl bg-sos/10 flex items-center justify-center text-sos border border-sos/20 transition-transform group-hover:scale-110">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground/90 uppercase tracking-tight italic">{alert.type}</h4>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{alert.loc}</p>
                  </div>
                </div>
                <span className="text-[8px] font-black text-sos/60 uppercase tracking-widest">{alert.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Voz do Povo (Poll) */}
      <section className="px-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 flex items-center gap-2">
            <Users size={14} />
            Voz do Povo
          </h2>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-[32px] p-8 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
             <TrendingUp size={120} />
          </div>
          <h3 className="text-xl font-bold font-display leading-tight mb-8 uppercase tracking-tight relative z-10 italic">
            Qual a prioridade para o bairro em 2026?
          </h3>
          <div className="space-y-6 relative z-10">
            <PollOption label="Iluminação Pública" percent={65} active />
            <PollOption label="Recapeamento Asfáltico" percent={20} />
            <PollOption label="Novas Áreas Verdes" percent={15} />
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center gap-2">
            <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">842 Votos Coletivos</span>
          </div>
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
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.15em]">
        <span className={active ? "text-primary opacity-100" : "text-muted-foreground opacity-40"}>{label}</span>
        <span className="opacity-60">{percent}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full", active ? "bg-primary shadow-[0_0_10px_rgba(0,209,255,0.4)]" : "bg-white/20")}
        />
      </div>
    </div>
  );
}
