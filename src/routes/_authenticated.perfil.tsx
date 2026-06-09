import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Settings, Award, Shield, ChevronRight, User as UserIcon, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header Perfil */}
      <div className="flex items-center gap-6 py-4">
        <div className="size-20 rounded-3xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center relative shadow-[0_0_30px_rgba(0,196,255,0.15)]">
          <UserIcon size={40} className="text-primary" />
          <div className="absolute -bottom-1 -right-1 size-7 bg-premium rounded-xl flex items-center justify-center text-primary-foreground border-2 border-background">
            <Award size={14} fill="currentColor" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight leading-none mb-1">Cidadão Exemplar</h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Nível 12 • 450 Pontos</p>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Denúncias Feitas</span>
          <p className="text-xl font-black mt-1">14</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Conquistas</span>
          <p className="text-xl font-black mt-1">08</p>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <MenuButton icon={<Settings size={18} />} label="Configurações da Conta" />
        <MenuButton icon={<CreditCard size={18} />} label="Métodos de Pagamento" />
        <MenuButton icon={<Shield size={18} />} label="Privacidade e Segurança" />
        
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-sos/10 border border-sos/20 text-sos hover:bg-sos/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold font-display uppercase tracking-widest">Sair do App</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="text-center opacity-30 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest">CIDADÃO+ v1.0.4</p>
      </div>
    </div>
  );
}

function MenuButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:bg-card-hover transition-all">
      <div className="flex items-center gap-3 text-foreground/80">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </button>
  );
}
