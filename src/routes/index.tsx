import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Home, ShoppingBag, Users, ShieldAlert, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden font-body">
      {/* Header com Gradiente */}
      <header className="sticky top-0 z-40 bg-gradient-to-br from-[#080C18] to-[#0A1628] px-6 py-6 border-b border-white/5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-2xl font-black tracking-tighter text-primary font-display">
            CIDADÃO<span className="text-secondary">+</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-display font-bold leading-none mb-1">Bairro</span>
              <span className="text-xs font-bold text-foreground">Jardim Paulista</span>
            </div>
            <div className="size-10 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
              <User size={20} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto relative px-2">
          <NavLink to="/" icon={<Home size={22} />} label="Início" />
          <NavLink to="/comercio" icon={<ShoppingBag size={22} />} label="Loja" />
          
          {/* SOS Central Button */}
          <div className="relative -top-6 flex flex-col items-center">
            <button className="sos-pulse size-16 rounded-full bg-sos flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,45,45,0.4)] hover:scale-105 active:scale-95 transition-transform">
              <ShieldAlert size={32} strokeWidth={2.5} />
            </button>
            <span className="text-[10px] font-bold mt-1 text-sos uppercase tracking-wider">SOS</span>
          </div>

          <NavLink to="/comunidade" icon={<Users size={22} />} label="Povo" />
          <NavLink to="/perfil" icon={<User size={22} />} label="Perfil" />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center gap-1 group relative py-2"
      activeProps={{ className: "text-primary" }}
      inactiveProps={{ className: "text-muted-foreground" }}
    >
      <div className="transition-transform group-active:scale-90">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      
      {/* Active Underline */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary rounded-full transition-all group-data-[status=active]:w-4" />
    </Link>
  );
}
