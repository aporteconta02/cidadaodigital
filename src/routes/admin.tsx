import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ShieldAlert,
  Megaphone,
  Settings,
  LogOut,
  Bell,
  Search,
  Calendar,
  MessageSquare,
  Image as ImageIcon,
  Phone,
  DollarSign,
  Star,
  Package,
  Car,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { usuario, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pending, setPending] = useState({ lojas: 0, eventos: 0, denuncias: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!usuario) navigate({ to: "/auth" });
      else if (!isAdmin) navigate({ to: "/dashboard" });
    }
  }, [usuario, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [{ count: l }, { count: e }, { count: d }] = await Promise.all([
        supabase.from("lojas").select("*", { count: "exact", head: true }).eq("aprovada", false),
        supabase.from("eventos").select("*", { count: "exact", head: true }).eq("aprovado", false),
        supabase.from("denuncias").select("*", { count: "exact", head: true }).eq("status", "enviada"),
      ]);
      setPending({ lojas: l ?? 0, eventos: e ?? 0, denuncias: d ?? 0 });
    })();
  }, [isAdmin]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center font-inter">
        <div className="size-10 border-[3px] border-admin-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPending = pending.lojas + pending.eventos + pending.denuncias;

  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Usuários", icon: Users, path: "/admin/usuarios" },
    { label: "Lojas e Comércio", icon: ShoppingBag, path: "/admin/lojas", badge: pending.lojas },
    { label: "Pedidos", icon: Package, path: "/admin/pedidos" },
    { label: "Transporte", icon: Car, path: "/admin/transporte" },
    { label: "Denúncias", icon: Megaphone, path: "/admin/denuncias", badge: pending.denuncias },
    { label: "Eventos", icon: Calendar, path: "/admin/eventos", badge: pending.eventos },
    { label: "Voz do Povo", icon: MessageSquare, path: "/admin/pesquisas" },
    { label: "Alertas de Segurança", icon: ShieldAlert, path: "/admin/seguranca" },
    { label: "Banners", icon: ImageIcon, path: "/admin/banners" },
    { label: "Telefones Úteis", icon: Phone, path: "/admin/telefones" },
    { label: "Clube de Benefícios", icon: Star, path: "/admin/clube" },
    { label: "Financeiro", icon: DollarSign, path: "/admin/financeiro" },
  ];

  const initials = usuario?.nome?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "AD";

  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-text font-inter" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-[244px] bg-admin-surface border-r border-admin-border flex flex-col fixed inset-y-0 overflow-y-auto z-30">
        <div className="px-6 py-5 border-b border-admin-border-light">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight" style={{
              background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              CIDADÃO+
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-admin-primary/10 text-admin-primary text-[10px] font-semibold uppercase tracking-wide">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path as any}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] transition-all",
                  active
                    ? "bg-admin-sidebar-active text-admin-primary font-semibold"
                    : "text-admin-text font-medium hover:bg-admin-hover"
                )}
              >
                <item.icon size={22} strokeWidth={active ? 2.25 : 1.75} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-admin-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <div className="my-3 h-px bg-admin-border-light mx-3" />

          <Link
            to={"/admin/configuracoes" as any}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] text-admin-text font-medium hover:bg-admin-hover"
          >
            <Settings size={22} strokeWidth={1.75} />
            Configurações
          </Link>
        </nav>

        <div className="p-3 border-t border-admin-border-light">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-9 rounded-full bg-admin-sidebar-active flex items-center justify-center text-admin-text text-xs font-semibold overflow-hidden">
              {usuario?.avatar_url ? (
                <img src={usuario.avatar_url} alt={usuario.nome} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{usuario?.nome}</p>
              <p className="text-xs text-admin-text-secondary">Administrador</p>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-admin-text-secondary hover:text-admin-danger transition-colors p-1.5 rounded-md hover:bg-admin-hover"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[244px] min-h-screen">
        {/* Header */}
        <header className="h-[60px] bg-admin-surface border-b border-admin-border px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="relative w-[280px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full h-9 bg-admin-border-light rounded-lg pl-9 pr-3 text-sm text-admin-text placeholder:text-admin-text-secondary focus:outline-none focus:ring-2 focus:ring-admin-primary/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative size-9 rounded-lg hover:bg-admin-hover flex items-center justify-center transition-colors">
              <Bell size={20} className="text-admin-text" strokeWidth={1.75} />
              {totalPending > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-admin-danger rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {totalPending}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-admin-hover transition-colors"
              >
                <div className="size-9 rounded-full bg-admin-sidebar-active flex items-center justify-center text-admin-text text-xs font-semibold overflow-hidden">
                  {usuario?.avatar_url ? (
                    <img src={usuario.avatar_url} alt={usuario.nome} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <span className="text-sm font-semibold">{usuario?.nome?.split(" ")[0]}</span>
                <ChevronDown size={16} className="text-admin-text-secondary" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-admin-surface border border-admin-border rounded-xl shadow-lg py-1.5 overflow-hidden">
                  <button
                    onClick={() => { setMenuOpen(false); navigate({ to: "/dashboard" }); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-admin-text hover:bg-admin-hover transition-colors"
                  >
                    Ver app
                  </button>
                  <Link
                    to={"/admin/configuracoes" as any}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-admin-text hover:bg-admin-hover transition-colors"
                  >
                    Configurações
                  </Link>
                  <div className="h-px bg-admin-border-light my-1" />
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full text-left px-4 py-2.5 text-sm text-admin-danger hover:bg-admin-hover transition-colors"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
