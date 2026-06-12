import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  ShieldAlert, 
  Megaphone, 
  Settings, 
  LogOut,
  Bell,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Usuários", icon: Users, path: "/admin/usuarios" },
    { label: "Marketplace", icon: ShoppingBag, path: "/admin/marketplace" },
    { label: "Segurança", icon: ShieldAlert, path: "/admin/seguranca" },
    { label: "Comunidade", icon: Megaphone, path: "/admin/comunidade" },
    { label: "Configurações", icon: Settings, path: "/admin/config" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0F0F16] text-white">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[#0A0A0F] border-r border-white/5 flex flex-col fixed inset-y-0">
        <div className="p-6">
          <h1 className="text-xl font-bold font-space uppercase italic tracking-tighter">
            ADMIN<span className="text-primary">.PLUS</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path as any}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                location.pathname === item.path 
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(108,99,255,0.2)]" 
                  : "text-text-muted hover:text-text-secondary hover:bg-white/5"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-colors",
                location.pathname === item.path ? "text-white" : "text-text-muted group-hover:text-text-secondary"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-danger hover:bg-danger/10 transition-all">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 ml-[240px]">
        {/* Top Header */}
        <header className="h-20 bg-[#0A0A0F]/50 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar dados, usuários ou relatórios..."
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-text-muted hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 size-4 bg-danger rounded-full border-2 border-[#0A0A0F] flex items-center justify-center text-[8px] font-black text-white">3</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold leading-none">Admin Master</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Super Usuário</p>
              </div>
              <div className="size-10 rounded-full bg-gradient-hero border-2 border-white/10" />
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
