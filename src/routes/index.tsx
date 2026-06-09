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
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        navigate({ to: "/dashboard" });
      } else {
        setChecking(false);
      }
    };
    checkUser();
  }, [navigate]);

  if (checking) return null;

  const isLastStep = selectedIndex === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      navigate({ to: "/auth" });
    } else {
      emblaApi?.scrollNext();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
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
        <div className="pt-12 px-8 flex justify-between items-center">
           <h1 className="text-2xl font-black font-display tracking-tighter uppercase">
            CIDADÃO<span className="text-primary">+</span>
          </h1>
          {!isLastStep && (
             <button 
              onClick={() => navigate({ to: "/auth" })}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
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
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="size-32 rounded-3xl bg-card border border-white/5 shadow-standard flex items-center justify-center mb-12 relative"
                >
                  <div className={`absolute inset-0 blur-2xl opacity-20 rounded-3xl ${step.color}`} />
                  {step.icon}
                </motion.div>
                
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  className="text-4xl font-black font-display tracking-tighter leading-none mb-6 uppercase"
                >
                  {step.title}
                </motion.h2>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-muted-foreground leading-relaxed"
                >
                  {step.description}
                </motion.p>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-16 px-8 flex flex-col items-center">
          {/* Progress dots */}
          <div className="flex gap-2 mb-10">
            {ONBOARDING_STEPS.map((_, i) => (
              <div 
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-standard text-lg uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isLastStep ? "Começar Agora" : "Próximo"}
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}
