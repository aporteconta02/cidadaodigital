import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { Shield, ShoppingBag, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Sua Cidade, Seu Bairro",
    description: "Tudo o que acontece perto de você em um único lugar. Participe ativamente da sua comunidade.",
    icon: <Users size={48} className="text-primary" />,
    color: "bg-primary/20",
  },
  {
    id: 2,
    title: "Segurança Colaborativa",
    description: "Alertas de segurança em tempo real e botão SOS para proteger você e sua vizinhança.",
    icon: <Shield size={48} className="text-sos" />,
    color: "bg-sos/20",
  },
  {
    id: 3,
    title: "Apoie o Comércio Local",
    description: "Descubra lojas, faça pedidos e aproveite benefícios exclusivos no Clube Cidadão+.",
    icon: <ShoppingBag size={48} className="text-secondary" />,
    color: "bg-secondary/20",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
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

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        console.log("Landing page: Checking user...");
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (data.session) {
          console.log("Landing page: Session found, redirecting to dashboard");
          navigate({ to: "/dashboard" });
        } else {
          setChecking(false);
        }
      } catch (error) {
        console.error("Landing page: Failed to check session", error);
        if (mounted) setChecking(false);
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (checking) return <StartupFallback />;

  const isLastStep = selectedIndex === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      navigate({ to: "/auth" });
    } else {
      emblaApi?.scrollNext();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary relative overflow-hidden">
      {/* Background blobs */}
      <AnimatePresence>
        <motion.div 
          key={selectedIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none"
        >
           <div className={`absolute top-[-10%] right-[-20%] size-[500px] blur-[120px] rounded-full ${ONBOARDING_STEPS[selectedIndex].color}`} />
           <div className={`absolute bottom-[-10%] left-[-20%] size-[500px] blur-[120px] rounded-full ${ONBOARDING_STEPS[selectedIndex].color} opacity-50`} />
        </motion.div>
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-10 w-full max-w-lg mx-auto overflow-hidden">
        <div className="pt-10 px-8 flex justify-between items-center">
           <h1 className="text-lg font-bold font-display tracking-tight uppercase italic">
            CIDADÃO<span className="text-primary">.PLUS</span>
          </h1>
          {!isLastStep && (
             <button 
              onClick={() => navigate({ to: "/auth" })}
              className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-all opacity-60 hover:opacity-100"
             >
              Pular
             </button>
          )}
        </div>

        <div className="flex-1 mt-8 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.id} className="flex-[0_0_100%] min-w-0 flex flex-col items-center justify-center px-10 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="size-40 rounded-[40px] bg-bg-card border border-white/5 shadow-card flex items-center justify-center mb-10 relative group"
                >
                  <div className={`absolute inset-0 blur-3xl opacity-10 rounded-full transition-all duration-500 group-hover:opacity-20 ${step.color}`} />
                  {step.icon}
                </motion.div>
                
                <motion.h2 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl font-bold font-space tracking-tight leading-tight mb-4 uppercase"
                >
                  {step.title}
                </motion.h2>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  className="text-base text-text-secondary leading-relaxed font-medium opacity-80"
                >
                  {step.description}
                </motion.p>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-16 px-8 flex flex-col items-center">
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-10">
            {ONBOARDING_STEPS.map((_, i) => (
              <div 
                key={i}
                className={`h-0.5 rounded-full transition-all duration-500 ease-in-out ${
                  i === selectedIndex ? "w-10 bg-primary" : "w-2 bg-white/10"
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-white text-black font-bold py-5 rounded-md shadow-card text-sm uppercase tracking-[0.1em] active:scale-[0.98] hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            {isLastStep ? "Começar agora" : "Explorar"}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </main>
    </div>
  );
}

function StartupFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0010",
        color: "#ffffff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            margin: "0 auto 16px",
            borderRadius: 14,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            boxShadow: "0 0 28px rgba(124, 58, 237, 0.45)",
          }}
        />
        <strong style={{ fontSize: 14, letterSpacing: 1.2 }}>CIDADÃO+</strong>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          Carregando app...
        </p>
      </div>
    </div>
  );
}
