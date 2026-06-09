import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Shield, MapPin, Users, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

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

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-20%] size-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[10%] left-[-20%] size-96 bg-secondary/10 blur-[120px] rounded-full" />

      <main className="flex-1 flex flex-col px-8 pt-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary mb-6">
            <Shield size={12} />
            <span>App Oficial da Cidade</span>
          </div>
          <h1 className="text-5xl font-black font-display tracking-tighter leading-none mb-4">
            CIDADÃO<span className="text-primary">+</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-snug">
            Civismo, comércio e segurança. <br/>
            Tudo do seu bairro num só lugar.
          </p>
        </motion.div>

        <div className="space-y-4 mb-12">
          <FeatureItem icon={<Shield className="text-sos" />} text="Alertas de segurança em tempo real" />
          <FeatureItem icon={<ShoppingBag className="text-secondary" />} text="Compre e apoie o comércio local" />
          <FeatureItem icon={<Users className="text-primary" />} text="Voz ativa na sua comunidade" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-auto pb-12"
        >
          <button 
            onClick={() => navigate({ to: "/auth" })}
            className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl shadow-standard text-lg uppercase tracking-wider active:scale-95 transition-transform"
          >
            Começar agora
          </button>
          <p className="text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-4 opacity-50">
            Disponível para todos os bairros
          </p>
        </motion.div>
      </main>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 bg-card/40 backdrop-blur-sm border border-white/5 p-4 rounded-2xl"
    >
      <div className="size-10 rounded-xl bg-background flex items-center justify-center border border-white/5">
        {icon}
      </div>
      <span className="text-sm font-bold text-foreground/80">{text}</span>
    </motion.div>
  );
}
