import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import React, { useEffect, type ReactNode } from "react";
import { Home, ShoppingBag, Users, ShieldAlert, User, Plus, Megaphone, Calendar, ClipboardList, AlertCircle, MapPin, MessageSquare, Phone } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider, useCart } from "@/hooks/use-cart";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/hooks/use-auth-store";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeToggle } from "@/components/ThemeToggle";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura sumiu ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Ops! Essa página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado por aqui. Tente atualizar ou volte para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Cidadão+ is a Brazilian hyperlocal super app connecting civic life, commerce, community, and neighborhood safety." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Cidadão+ is a Brazilian hyperlocal super app connecting civic life, commerce, community, and neighborhood safety." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Cidadão+ is a Brazilian hyperlocal super app connecting civic life, commerce, community, and neighborhood safety." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f6ce6e9b-2935-4eb1-8e02-86b55f33a7e7/id-preview-933308de--16cbf638-dbf2-45eb-b749-d0e454bb09b3.lovable.app-1781258360326.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f6ce6e9b-2935-4eb1-8e02-86b55f33a7e7/id-preview-933308de--16cbf638-dbf2-45eb-b749-d0e454bb09b3.lovable.app-1781258360326.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
        crossOrigin: "",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();
  const { profile, logout } = useAuthStore();
  const isPublicPage = ['/', '/auth'].includes(location.pathname) || location.pathname.startsWith('/admin');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        router.invalidate();
      }
      if (event === 'SIGNED_OUT') {
        try { localStorage.removeItem('cp-cart'); } catch {}
        logout();
        router.invalidate();
        router.navigate({ to: '/auth' });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);


  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
        <div className={cn(
          "flex min-h-screen flex-col bg-bg-primary text-text-primary overflow-x-hidden font-jakarta",
          !isPublicPage && "pb-[72px]"
        )}>
        <Toaster position="top-center" expand={true} richColors />
        {/* App Header (Hidden on landing/auth) */}
        {!isPublicPage && (
          <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl px-4 py-4 border-b border-white/5">
            <div className="flex flex-col gap-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tighter font-space uppercase italic bg-gradient-hero bg-clip-text text-transparent">
                  CIDADÃO<span className="">.</span><span className="">PLUS</span>
                </h1>
                <div className="flex items-center gap-3">
                  <Link 
                    to="/sos"
                    className="relative size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                  >
                    <ShieldAlert size={20} className="text-text-primary" />
                    <div className="absolute -top-1 -right-1 size-5 bg-danger rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-bg-primary">
                      3
                    </div>
                  </Link>
                  <div className="size-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center transition-transform active:scale-95 cursor-pointer">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.nome} className="size-full object-cover" />
                    ) : (
                      <span className="text-text-primary font-bold text-xs">
                        {profile?.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'CP'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-transform">
                <MapPin size={14} className="text-primary" />
                <span className="micro-text font-bold text-text-primary uppercase tracking-wider">
                  {profile?.cidade && profile?.bairro ? `${profile.cidade}, ${profile.bairro}` : (profile?.cidade || profile?.bairro || 'Localização')}
                </span>
              </button>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className={cn("flex-1 w-full", !isPublicPage && "max-w-lg mx-auto overflow-y-auto")}>
          <div key={location.pathname} className="page-transition-container">
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation (Hidden on landing/auth) */}
        {!isPublicPage && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-[20px] border-t border-white/5 pb-safe shadow-card">
            <div className="flex items-center justify-around bottom-nav-height max-w-lg mx-auto relative px-4">
              <NavLink to="/dashboard" icon={<Home size={22} />} label="Início" />
              <NavLink to="/comercio" icon={<ShoppingBag size={22} />} label="Mercado" cartBadge />
              
              {/* Central Plus Button */}
              <Drawer>
                <DrawerTrigger asChild>
                  <button className="relative z-10 size-14 rounded-full bg-gradient-hero -translate-y-4 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(108,99,255,0.5)] active:scale-90 transition-transform cursor-pointer">
                    <Plus size={28} strokeWidth={3} />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="bg-bg-elevated border-border-custom max-w-lg mx-auto rounded-t-3xl">
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <ActionButton onClick={() => router.navigate({ to: '/comunidade', search: { tab: 'denuncias', new: true } as any })} icon={<Megaphone className="text-primary" />} label="Denunciar" />
                    <ActionButton onClick={() => router.navigate({ to: '/comunidade', search: { tab: 'eventos', new: true } as any })} icon={<Calendar className="text-secondary" />} label="Novo Evento" />
                    <ActionButton onClick={() => router.navigate({ to: '/comunidade', search: { tab: 'mural', new: true } as any })} icon={<ClipboardList className="text-success" />} label="Mural" />
                    <ActionButton onClick={() => router.navigate({ to: '/sos', search: { new: true } as any })} icon={<AlertCircle className="text-danger" />} label="Reportar Alerta" />
                  </div>
                  <div className="px-6 pb-8">
                    <DrawerClose asChild>
                      <button className="w-full py-4 rounded-md bg-white/5 text-text-secondary font-bold uppercase tracking-wider text-xs">
                        Cancelar
                      </button>
                    </DrawerClose>
                  </div>
                </DrawerContent>
              </Drawer>

              <NavLink to="/comunidade" icon={<Users size={22} />} label="Cidade" />
              <NavLink to="/sos" icon={<ShieldAlert size={22} />} label="Seguro" />
              <NavLink to="/perfil" icon={<User size={22} />} label="Perfil" />
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
                className="hidden" // Botão invisível para facilitar teste de logout se necessário, ou apenas deixar no perfil
              />
            </div>
          </nav>
        )}
        </div>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
);
}

function NavLink({ to, icon, label, cartBadge }: { to: string; icon: React.ReactNode; label: string; cartBadge?: boolean }) {
  const { totalItens } = useCart();
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center gap-1 group relative py-2 w-14"
      activeProps={{ className: "text-primary active-link" }}
      inactiveProps={{ className: "text-text-muted" }}
    >
      <div className="transition-all group-active:scale-90 relative">
        {icon}
        {cartBadge && totalItens > 0 && (
          <div className="absolute -top-1 -right-1 size-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border border-bg-primary">
            {totalItens}
          </div>
        )}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight hidden group-[.active-link]:block">
        {label}
      </span>
      
      {/* Active Indicator Point */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 transition-opacity group-[.active-link]:opacity-100" />
    </Link>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 active:scale-95 transition-all hover:bg-white/10">
      <div className="size-12 rounded-full bg-bg-primary flex items-center justify-center shadow-card">
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 24 })}
      </div>
      <span className="micro-text font-bold text-text-primary uppercase tracking-wider text-center">
        {label}
      </span>
    </button>
  );
}

