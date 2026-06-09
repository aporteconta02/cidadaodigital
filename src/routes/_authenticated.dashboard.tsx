import { createFileRoute } from "@tanstack/react-router";
import { Search, MapPin, AlertCircle, ShoppingBasket, Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
        <input 
          placeholder="Buscar serviços, ocorrências..." 
          className="w-full bg-card border-border rounded-xl py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Hero card */}
      <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-primary/10 to-transparent border border-white/10">
        <div className="relative z-10">
          <h2 className="text-2xl font-black font-display text-foreground leading-tight mb-2">Seu bairro,<br/>melhor a cada dia.</h2>
          <p className="text-sm text-muted-foreground mb-4">Você tem 3 alertas de segurança hoje.</p>
          <button className="bg-primary text-primary-foreground font-bold px-6 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity">
            Ver agora
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <MapPin size={160} />
        </div>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: <AlertCircle />, label: "Ocorrências", color: "text-sos" },
          { icon: <ShoppingBasket />, label: "Comércio Local", color: "text-secondary" },
        ].map((item, i) => (
          <button key={i} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card border border-border hover:bg-card-hover transition-colors shadow-standard">
            <div className={item.color}>{item.icon}</div>
            <span className="text-xs font-bold font-display uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
