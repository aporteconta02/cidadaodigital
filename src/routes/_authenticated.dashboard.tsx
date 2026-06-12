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
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const CATEGORIES = [
  { label: "Horários de ônibus", icon: <Bus size={24} />, color: "bg-blue-500 text-white" },
  { label: "Utilidades públicas", icon: <Info size={24} />, color: "bg-orange-500 text-white" },
  { label: "Vagas de empregos", icon: <Briefcase size={24} />, color: "bg-green-500 text-white" },
  { label: "Água e gás", icon: <Flame size={24} />, color: "bg-red-500 text-white" },
  { label: "Delivery", icon: <Truck size={24} />, color: "bg-yellow-500 text-white" },
  { label: "Táxis e aplicativos", icon: <Car size={24} />, color: "bg-indigo-500 text-white" },
  { label: "Turismo e cultura", icon: <Palmtree size={24} />, color: "bg-teal-500 text-white" },
  { label: "anuncie grátis", icon: <PlusCircle size={24} />, color: "bg-pink-500 text-white", highlight: true },
  { label: "Mercados e Afins", icon: <ShoppingBag size={24} />, color: "bg-lime-500 text-white" },
  { label: "Moda e Beleza", icon: <Scissors size={24} />, color: "bg-purple-500 text-white" },
  { label: "Agências e Lotéricas", icon: <Building size={24} />, color: "bg-slate-500 text-white" },
  { label: "Tecnologia e Car", icon: <Smartphone size={24} />, color: "bg-cyan-500 text-white" },
  { label: "Tudo para Casa", icon: <Home size={24} />, color: "bg-amber-500 text-white" },
  { label: "Imóveis e Construção", icon: <HardHat size={24} />, color: "bg-stone-500 text-white" },
  { label: "Saúde e bem-estar", icon: <Heart size={24} />, color: "bg-rose-500 text-white" },
];

function DashboardPage() {
  const { profile } = Route.useRouteContext();
  const [user, setUser] = useState<any>(profile);
  const [loading, setLoading] = useState(!profile);

  useEffect(() => {
    let isMounted = true;
    
    if (profile) {
      setUser(profile);
      setLoading(false);
    } else {
      const checkProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          const { data } = await supabase.from('usuarios').select('*').eq('auth_id', session.user.id).maybeSingle();
          if (data && isMounted) {
            setUser(data);
          }
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
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
      

      {/* Categories Grid */}
      <section className="px-4 mb-10">
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((category, idx) => (
            <motion.button 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-5 rounded-[28px] transition-all duration-300 active:scale-95 group",
                category.highlight ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5"
              )}
            >
              <div className={cn("size-14 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg", category.color)}>
                {category.icon}
              </div>
              <span className="text-[10px] font-black text-center leading-tight uppercase tracking-wider text-white opacity-90 group-hover:opacity-100 transition-opacity">
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
