import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { 
  ShoppingBag, 
  Megaphone, 
  Calendar, 
  ShieldCheck, 
  MessageSquare, 
  ClipboardList, 
  Star, 
  Phone,
  ChevronRight,
  MapPin,
  ShieldAlert,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useAuth } from "@/hooks/use-auth";
import Autoplay from "embla-carousel-autoplay";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const QUICK_ACCESS = [
  { label: "Mercado", icon: <ShoppingBag size={24} />, color: "text-primary", to: "/comercio" },
  { label: "Denunciar", icon: <Megaphone size={24} />, color: "text-secondary", modal: "denuncia" },
  { label: "Eventos", icon: <Calendar size={24} />, color: "text-success", to: "/comunidade" },
  { label: "Seguro", icon: <ShieldCheck size={24} />, color: "text-primary", to: "/sos" },
  { label: "Voz do Povo", icon: <MessageSquare size={24} />, color: "text-secondary", to: "/comunidade" },
  { label: "Mural", icon: <ClipboardList size={24} />, color: "text-success", to: "/comunidade" },
  { label: "Benefícios", icon: <Star size={24} />, color: "text-gold", to: "/perfil" },
  { label: "Telefones", icon: <Phone size={24} />, color: "text-text-secondary", to: "/comunidade" },
];

function DashboardPage() {
  const { usuario, loading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({ banners: [], eventos: [], pesquisa: null, parceiros: [], alertas: [] });

  useEffect(() => {
    async function fetchData() {
      if (!usuario) return;
      
      const [banners, eventos, pesquisa, parceiros, alertas] = await Promise.all([
        supabase.from('banners').select('*').eq('ativo', true).order('posicao'),
        supabase.from('eventos').select('*').eq('destaque', true).eq('aprovado', true).limit(5),
        supabase.from('pesquisas').select('*').eq('ativa', true).limit(1).maybeSingle(),
        supabase.from('parceiros_clube').select('*, lojas(*)').eq('ativo', true).limit(6),
        usuario.assinante_plus 
          ? supabase.from('alertas_seguranca').select('*').eq('bairro', usuario.bairro).gt('expira_em', new Date().toISOString()).limit(3)
          : { data: [] }
      ]);

      setData({
        banners: banners.data || [],
        eventos: eventos.data || [],
        pesquisa: pesquisa.data,
        parceiros: parceiros.data || [],
        alertas: alertas.data || []
      });
    }
    fetchData();
  }, [usuario]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="pb-32 bg-bg-primary min-h-screen">
      <section className="px-6 pt-10 pb-2">
        <h1 className="text-2xl font-black font-space tracking-tighter italic text-text-primary mb-1">
          {getGreeting()}, {usuario?.nome?.split(' ')[0]}! 👋
        </h1>
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-text-muted opacity-60">
          <MapPin size={12} /> {usuario?.cidade}, {usuario?.bairro}
        </div>
      </section>

      {/* Hero Banners */}
      <section className="px-4 mb-8">
        <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
          <CarouselContent>
            {data.banners.map((b: any) => (
              <CarouselItem key={b.id}>
                <div className="h-[180px] w-full rounded-lg p-6 bg-gradient-hero flex flex-col justify-center text-white">
                  <h3 className="text-xl font-bold">{b.titulo}</h3>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Quick Access */}
      <section className="px-4 mb-10">
        <h2 className="text-sm font-black uppercase tracking-tight mb-4 ml-1">Acesso Rápido</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACCESS.map((item, idx) => (
            <button key={idx} onClick={() => item.to ? navigate({ to: item.to as any }) : null} className="flex flex-col items-center gap-2 group">
              <div className="size-[72px] rounded-lg glass flex items-center justify-center shadow-card">
                <div className={item.color}>{item.icon}</div>
              </div>
              <span className="text-[10px] font-bold text-text-secondary uppercase text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Alertas */}
      {data.alertas.length > 0 && (
        <section className="px-4 mb-8">
          <h2 className="text-sm font-black uppercase mb-4 flex items-center gap-2 text-danger">
            <ShieldAlert size={16} /> Alertas de Segurança
          </h2>
          {data.alertas.map((a: any) => (
            <div key={a.id} className="p-4 bg-danger/10 border border-danger/20 rounded-lg mb-2">
              <h4 className="font-bold text-danger text-sm">{a.titulo}</h4>
              <p className="text-xs text-text-muted">{a.descricao}</p>
            </div>
          ))}
        </section>
      )}

      {/* Voz do Povo */}
      {data.pesquisa && (
        <section className="px-4 mb-10">
          <div className="bg-bg-card border border-white/5 rounded-lg p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
              <MessageSquare size={60} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Voz do Povo • Pesquisa Ativa</span>
              <h3 className="font-bold text-lg mb-4 text-white">{data.pesquisa.titulo}</h3>
              <button 
                onClick={() => navigate({ to: '/comunidade' })}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-glow active:scale-95 transition-all"
              >
                Votar Agora
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
