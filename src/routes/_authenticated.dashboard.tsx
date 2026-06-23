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
  AlertCircle,
  Car
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import Autoplay from "embla-carousel-autoplay";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const QUICK_ACCESS = [
  { label: "Mercado", icon: <ShoppingBag size={24} />, color: "text-primary", to: "/comercio" },
  { label: "Transporte", icon: <Car size={24} />, color: "text-primary", to: "/transporte" },
  { label: "Denúncias / Solicitações", icon: <Megaphone size={24} />, color: "text-secondary", to: "/comunidade", search: { tab: 'denuncias' } },
  { label: "Eventos", icon: <Calendar size={24} />, color: "text-success", to: "/comunidade", search: { tab: 'eventos' } },
  { label: "Vizinho Seguro", icon: <ShieldCheck size={24} />, color: "text-primary", to: "/sos" },
  { label: "Voz do Povo", icon: <MessageSquare size={24} />, color: "text-secondary", to: "/comunidade", search: { tab: 'voz' } },
  { label: "Mural", icon: <ClipboardList size={24} />, color: "text-success", to: "/comunidade", search: { tab: 'mural' } },
  { label: "Benefícios", icon: <Star size={24} />, color: "text-gold", to: "/perfil" },
  { label: "Telefones", icon: <Phone size={24} />, color: "text-text-secondary", to: "/comunidade", search: { tab: 'telefones' } },
];

function DashboardPage() {
  const { usuario, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({ banners: [], eventos: [], pesquisa: null, parceiros: [], alertas: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!usuario) return;
      setLoading(true);
      try {
        const [banners, eventos, pesquisa, parceiros, alertas] = await Promise.all([
          supabase.from('banners').select('*').eq('ativo', true).order('posicao'),
          supabase.from('eventos').select('*').eq('destaque', true).eq('aprovado', true).gte('data_evento', new Date().toISOString()).limit(5),
          supabase.from('pesquisas').select('*').eq('ativa', true).limit(1).maybeSingle(),
          supabase.from('parceiros_clube').select('*, lojas(*)').eq('ativo', true).limit(6),
          usuario.assinante_plus 
            ? supabase.from('alertas_seguranca').select('*').eq('bairro', usuario.bairro).eq('ativo', true).gt('expira_em', new Date().toISOString()).limit(3)
            : { data: [] }
        ]);

        setData({
          banners: banners.data || [],
          eventos: eventos.data || [],
          pesquisa: pesquisa.data,
          parceiros: parceiros.data || [],
          alertas: alertas.data || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [usuario]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (authLoading) return (
    <div className="p-6 space-y-8">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-[180px] w-full rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="pb-32 bg-bg-primary min-h-screen animate-in fade-in duration-500">
      <section className="px-6 pt-10 pb-2">
        <h1 className="text-2xl font-black font-space tracking-tighter italic text-text-primary mb-1">
          {getGreeting()}, {usuario?.nome?.split(' ')[0]}! 👋
        </h1>
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-text-muted opacity-60">
          <MapPin size={12} /> {usuario?.cidade}, {usuario?.bairro}
        </div>
      </section>

      {/* Hero Banners */}
      <section className="px-4 mb-8 mt-4">
        {loading ? (
          <Skeleton className="h-[180px] w-full rounded-2xl" />
        ) : data.banners.length > 0 ? (
          <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
            <CarouselContent>
              {data.banners.map((b: any) => (
                <CarouselItem key={b.id}>
                  <div 
                    onClick={() => {
                      if (!b.link_destino) return;
                      if (/^https?:\/\//i.test(b.link_destino)) window.open(b.link_destino, '_blank', 'noopener,noreferrer');
                      else navigate({ to: b.link_destino });
                    }}
                    className="h-[180px] w-full rounded-2xl overflow-hidden relative cursor-pointer"
                  >
                    <img src={b.imagem_url} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                       <h3 className="text-xl font-bold text-white leading-tight">{b.titulo}</h3>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="h-[180px] w-full rounded-2xl bg-gradient-hero flex flex-col justify-center p-8 text-white">
             <h3 className="text-xl font-bold">Bem-vindo ao Cidadão+</h3>
             <p className="text-sm opacity-80 mt-1">Sua cidade na palma da mão.</p>
          </div>
        )}
      </section>

      {/* Quick Access */}
      <section className="px-4 mb-10">
        <h2 className="text-sm font-black uppercase tracking-tight mb-4 ml-1">Acesso Rápido</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACCESS.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => navigate({ to: item.to as any, search: item.search as any })} 
              className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
            >
              <div className="size-[72px] rounded-2xl glass flex items-center justify-center shadow-card border border-white/5">
                <div className={item.color}>{item.icon}</div>
              </div>
              <span className="text-[10px] font-bold text-text-secondary uppercase text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Alertas Ativos */}
      {data.alertas.length > 0 && (
        <section className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm font-black uppercase flex items-center gap-2 text-danger italic">
               <ShieldAlert size={16} /> Alertas Ativos
             </h2>
             <button onClick={() => navigate({ to: '/sos' })} className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline">Ver mapa</button>
          </div>
          <div className="space-y-3">
            {data.alertas.map((a: any) => (
              <div key={a.id} className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-4">
                <div className="size-10 rounded-xl bg-danger/20 flex items-center justify-center text-danger">
                   <AlertCircle size={20} />
                </div>
                <div>
                   <h4 className="font-bold text-danger text-sm uppercase tracking-tight">{a.tipo}</h4>
                   <p className="text-xs text-text-secondary line-clamp-1">{a.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Voz do Povo */}
      {data.pesquisa && (
        <section className="px-4 mb-10">
          <div className="bg-bg-card border border-white/5 rounded-[32px] p-7 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
              <MessageSquare size={80} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block italic">Voz do Povo • Pesquisa Ativa</span>
              <h3 className="font-bold text-lg mb-6 text-white leading-snug">{data.pesquisa.titulo}</h3>
              <button 
                onClick={() => navigate({ to: '/comunidade', search: { tab: 'voz', pesquisaId: data.pesquisa.id } as any })}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-glow active:scale-95 transition-all"
              >
                Votar Agora
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Eventos em Destaque */}
      {data.eventos.length > 0 && (
        <section className="px-4 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-tight ml-1 italic">Eventos no Bairro</h2>
            <button onClick={() => navigate({ to: '/comunidade', search: { tab: 'eventos' } as any })} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Ver todos</button>
          </div>
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {data.eventos.map((event: any) => (
                <CarouselItem key={event.id} className="pl-4 basis-[85%]">
                  <div 
                    onClick={() => navigate({ to: '/comunidade', search: { tab: 'eventos' } as any })}
                    className="bg-bg-card rounded-[24px] overflow-hidden border border-white/5 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                  >
                    <div className="h-32 w-full relative">
                      <img src={event.banner_url || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800"} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase rounded-lg shadow-xl">
                        {format(new Date(event.data_evento), "dd 'DE' MMM", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-white line-clamp-1">{event.titulo}</h4>
                      <p className="text-[10px] text-text-muted mt-1 uppercase font-black tracking-widest">{event.categoria}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>
      )}

      {!loading && data.eventos.length === 0 && !data.pesquisa && data.alertas.length === 0 && (
        <div className="px-6 py-20 text-center opacity-40">
           <AlertCircle size={48} className="mx-auto mb-4 text-text-muted" />
           <p className="text-xs font-bold uppercase tracking-[0.2em]">Tudo tranquilo no seu bairro por enquanto!</p>
        </div>
      )}
    </div>
  );
}