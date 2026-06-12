import { createFileRoute } from "@tanstack/react-router";
import { 
  Search, 
  Bus,
  Info,
  Briefcase,
  Flame,
  Truck,
  Car,
  Palmtree,
  PlusCircle,
  ShoppingBag,
  Scissors,
  Building,
  Smartphone,
  Home,
  HardHat,
  Heart,
  MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const CATEGORIES = [
  { label: "Horários de ônibus", icon: <Bus size={28} />, color: "bg-blue-500/10 text-blue-500" },
  { label: "Utilidades públicas", icon: <Info size={28} />, color: "bg-orange-500/10 text-orange-500" },
  { label: "Vagas de empregos", icon: <Briefcase size={28} />, color: "bg-green-500/10 text-green-500" },
  { label: "Água e gás", icon: <Flame size={28} />, color: "bg-red-500/10 text-red-500" },
  { label: "Delivery", icon: <Truck size={28} />, color: "bg-yellow-500/10 text-yellow-500" },
  { label: "Táxis e aplicativos", icon: <Car size={28} />, color: "bg-indigo-500/10 text-indigo-500" },
  { label: "Turismo e cultura", icon: <Palmtree size={28} />, color: "bg-teal-500/10 text-teal-500" },
  { label: "anuncie grátis", icon: <PlusCircle size={28} />, color: "bg-pink-500/10 text-pink-500", highlight: true },
  { label: "Mercados e Afins", icon: <ShoppingBag size={28} />, color: "bg-lime-500/10 text-lime-500" },
  { label: "Moda e Beleza", icon: <Scissors size={28} />, color: "bg-purple-500/10 text-purple-500" },
  { label: "Agências e Lotéricas", icon: <Building size={28} />, color: "bg-slate-500/10 text-slate-500" },
  { label: "Tecnologia e Car", icon: <Smartphone size={28} />, color: "bg-cyan-500/10 text-cyan-500" },
  { label: "Tudo para Casa", icon: <Home size={28} />, color: "bg-amber-500/10 text-amber-500" },
  { label: "Imóveis e Construção", icon: <HardHat size={28} />, color: "bg-stone-500/10 text-stone-500" },
  { label: "Saúde e bem-estar", icon: <Heart size={28} />, color: "bg-rose-500/10 text-rose-500" },
];

function DashboardPage() {
  const { profile } = Route.useRouteContext();
  const [user, setUser] = useState<any>(profile);
  const [loading, setLoading] = useState(!profile);

  useEffect(() => {
    if (profile) {
      setUser(profile);
      setLoading(false);
    } else {
      const checkProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase.from('usuarios').select('*').eq('auth_id', session.user.id).maybeSingle();
          if (data) {
            setUser(data);
          }
        }
        setLoading(false);
      };
      checkProfile();
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-current"></div>
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
      
      {/* Search Header */}
      <div className="px-6 pt-6 mb-6">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
          <input 
            placeholder="O que você procura hoje?" 
            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-12 pr-5 text-sm font-medium placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all shadow-soft"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <section className="px-4 mb-8">
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((category, idx) => (
            <motion.button 
              key={idx} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-300 active:scale-95 border border-white/[0.02]",
                category.highlight ? "bg-primary/10 border-primary/20" : "bg-white/[0.02]"
              )}
            >
              <div className={cn("p-3 rounded-xl transition-colors", category.color)}>
                {category.icon}
              </div>
              <span className="text-[9px] font-bold text-center leading-tight uppercase tracking-wide opacity-80">
                {category.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="px-6 mb-8">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-6 shadow-premium relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
             <MessageSquare size={100} />
          </div>
          <div className="relative z-10">
            <h3 className="text-white font-black text-lg leading-tight uppercase italic mb-2">
              ENTRE EM NOSSO GRUPO E<br />
              SAIA NA FRENTE DO CONCORRENTE
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Acesse agora</span>
              <div className="size-5 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight size={12} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
