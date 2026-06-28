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
import React, { useEffect, useState, type ReactNode } from "react";
import { Home, ShoppingBag, Users, ShieldAlert, User, Megaphone, Calendar, ClipboardList, Phone, Bus, Star, MapPin, Menu, X, Settings, LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider, useCart } from "@/hooks/use-cart";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/hooks/use-auth-store";



import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OfflineBanner } from "@/components/OfflineBanner";
import { registerServiceWorker } from "@/lib/register-sw";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { title: "CIDADÃO+ — Super app da sua cidade" },
      { name: "description", content: "Cidadão+ é o super app hiperlocal de Santa Luzia - MG: comércio, comunidade, transporte e segurança no mesmo lugar." },
      { name: "author", content: "Lovable" },
      { name: "theme-color", content: "#7c3aed" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "CIDADÃO+" },
      { property: "og:title", content: "CIDADÃO+ — Super app da sua cidade" },
      { property: "og:description", content: "Cidadão+ é o super app hiperlocal de Santa Luzia - MG: comércio, comunidade, transporte e segurança no mesmo lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "CIDADÃO+ — Super app da sua cidade" },
      { name: "twitter:description", content: "Cidadão+ é o super app hiperlocal de Santa Luzia - MG: comércio, comunidade, transporte e segurança no mesmo lugar." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f6ce6e9b-2935-4eb1-8e02-86b55f33a7e7/id-preview-933308de--16cbf638-dbf2-45eb-b749-d0e454bb09b3.lovable.app-1781258360326.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f6ce6e9b-2935-4eb1-8e02-86b55f33a7e7/id-preview-933308de--16cbf638-dbf2-45eb-b749-d0e454bb09b3.lovable.app-1781258360326.png" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
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

  const [temAtualizacao, setTemAtualizacao] = useState(false);

  useEffect(() => {
    registerServiceWorker();

    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let detachUpdateFound: (() => void) | undefined;
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      if (reg.waiting && navigator.serviceWorker.controller) {
        setTemAtualizacao(true);
      }
      const onUpdateFound = () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener("statechange", () => {
          if (newSW.state === "installed" && navigator.serviceWorker.controller) {
            setTemAtualizacao(true);
          }
        });
      };
      reg.addEventListener("updatefound", onUpdateFound);
      detachUpdateFound = () => reg.removeEventListener("updatefound", onUpdateFound);
    }).catch(() => {});

    const interval = window.setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) reg.update();
      }).catch(() => {});
    }, 30000);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.clearInterval(interval);
      detachUpdateFound?.();
    };
  }, []);

  const aplicarAtualizacao = () => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
    }).catch(() => {});
    setTimeout(() => window.location.reload(), 500);
  };

  useEffect(() => {
    if (typeof caches === "undefined") return;
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (
          !cacheName.includes("workbox") &&
          !cacheName.includes("pages-cache") &&
          !cacheName.includes("assets-cache") &&
          !cacheName.includes("images-cache")
        ) {
          caches.delete(cacheName).catch(() => {});
        }
      });
    }).catch(() => {});
  }, []);






  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
        <div className={cn(
          "flex min-h-screen flex-col bg-bg-primary text-text-primary overflow-x-hidden font-jakarta",
        )}>
        <Toaster position="top-center" expand={true} richColors />
        {temAtualizacao && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, right: 0,
              background: "#7c3aed", color: "white",
              padding: "12px", textAlign: "center",
              zIndex: 99999, fontSize: "14px",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "12px",
            }}
          >
            🔄 Nova versão disponível!
            <button
              onClick={aplicarAtualizacao}
              style={{
                background: "white", color: "#7c3aed",
                border: "none", borderRadius: "6px",
                padding: "4px 12px", cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Atualizar agora
            </button>
          </div>
        )}
        <OfflineBanner />
        <InstallPrompt />
        {/* Floating theme toggle on public pages */}
        {isPublicPage && (
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        )}
        {/* App Header (Hidden on landing/auth) */}
        {!isPublicPage && (
          <header className="sticky top-0 z-40 px-4 py-3 backdrop-blur-xl" style={{ background: 'rgba(13, 0, 32, 0.7)', borderBottom: '1px solid rgba(124,58,237,0.15)', boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
              {/* Left: avatar + greeting */}
              <Link
                to="/perfil"
                className="flex items-center gap-2 active:scale-95 transition-transform min-w-0"
              >
                <div
                  className="size-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                  style={{
                    border: '2px solid transparent',
                    background: 'linear-gradient(#0a0010, #0a0010) padding-box, linear-gradient(135deg, #7c3aed, #06b6d4) border-box',
                  }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.nome} className="size-full object-cover rounded-full" />
                  ) : (
                    <span className="text-text-primary font-bold text-xs">
                      {profile?.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'CP'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Olá,</span>
                  <span className="text-xs font-bold text-text-primary truncate max-w-[110px]">
                    {profile?.nome?.split(' ')[0] || 'Cidadão'}!
                  </span>
                </div>
              </Link>

              {/* Center: brand */}
              <Link to="/dashboard" className="flex-1 text-center min-w-0">
                <h1 className="text-base sm:text-lg font-bold tracking-tighter font-space uppercase italic bg-gradient-hero bg-clip-text text-transparent truncate">
                  CIDADÃO<span>+</span>
                </h1>
              </Link>

              {/* Right: theme + hamburger */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      aria-label="Abrir menu"
                      className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                    >
                      <Menu size={20} className="text-text-primary" />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[88vw] sm:w-[380px] p-0 flex flex-col border-l-0"
                    style={{
                      background: 'rgba(10, 0, 16, 0.95)',
                      backdropFilter: 'blur(30px)',
                      borderRight: '1px solid rgba(124, 58, 237, 0.2)',
                    }}
                  >
                    {/* Drawer header: profile */}
                    <div className="p-6 border-b border-[rgba(124,58,237,0.2)] bg-gradient-to-br from-[rgba(124,58,237,0.18)] to-transparent">
                      <div className="flex items-center gap-4">
                        <div
                          className="size-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                          style={{
                            padding: 3,
                            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                          }}
                        >
                          <div className="size-full rounded-full overflow-hidden flex items-center justify-center bg-[#0a0010]">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt={profile.nome} className="size-full object-cover" />
                            ) : (
                              <span className="text-text-primary font-bold text-xl">
                                {profile?.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'CP'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold text-text-primary truncate">
                            {profile?.nome || 'Cidadão'}
                          </p>
                          <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                            <MapPin size={12} />
                            <span className="truncate">{(profile as any)?.cidade || 'Santa Luzia - MG'}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nav list */}
                    <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                      <DrawerNavLink to="/dashboard"   icon={<Home size={20} />}         label="Início"                    iconGradient="from-[#a855f7] to-[#7c3aed]" />
                      <DrawerNavLink to="/comercio"    icon={<ShoppingBag size={20} />}  label="Mercado"                   iconGradient="from-[#f97316] to-[#ef4444]" />
                      <DrawerNavLink to="/comunidade"  icon={<Megaphone size={20} />}    label="Denúncias / Solicitações"  iconGradient="from-[#ef4444] to-[#dc2626]" search={{ tab: 'denuncias' }} />
                      <DrawerNavLink to="/comunidade"  icon={<Calendar size={20} />}     label="Eventos"                   iconGradient="from-[#10b981] to-[#059669]" search={{ tab: 'eventos' }} />
                      <DrawerNavLink to="/sos"         icon={<ShieldAlert size={20} />}  label="Vizinho Seguro"            iconGradient="from-[#3b82f6] to-[#1d4ed8]" />
                      <DrawerNavLink to="/comunidade"  icon={<Users size={20} />}        label="Voz do Povo"               iconGradient="from-[#f59e0b] to-[#d97706]" search={{ tab: 'voz' }} />
                      <DrawerNavLink to="/comunidade"  icon={<ClipboardList size={20} />} label="Mural"                    iconGradient="from-[#ec4899] to-[#db2777]" search={{ tab: 'mural' }} />
                      <DrawerNavLink to="/comercio"    icon={<Star size={20} />}         label="Benefícios"                iconGradient="from-[#a855f7] to-[#7c3aed]" />
                      <DrawerNavLink to="/comunidade"  icon={<Phone size={20} />}        label="Telefones"                 iconGradient="from-[#6b7280] to-[#4b5563]" search={{ tab: 'telefones' }} />
                      <DrawerNavLink to="/transporte"  icon={<Bus size={20} />}          label="Transporte"                iconGradient="from-[#06b6d4] to-[#0284c7]" />

                      <div className="h-px bg-[rgba(124,58,237,0.2)] my-3" />

                      <DrawerNavLink to="/perfil" icon={<Settings size={20} />} label="Configurações" iconGradient="from-[#a855f7] to-[#7c3aed]" />
                      <SheetClose asChild>
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-danger hover:bg-danger/10 transition-colors"
                        >
                          <LogOut size={20} />
                          <span className="text-sm font-semibold">Sair da conta</span>
                        </button>
                      </SheetClose>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className={cn("flex-1 w-full", !isPublicPage && "max-w-lg mx-auto")}>
          <div key={location.pathname} className="page-transition-container">
            <Outlet />
          </div>
        </main>
        </div>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
);
}

function DrawerNavLink({
  to,
  icon,
  label,
  search,
  iconGradient = "from-[#a855f7] to-[#7c3aed]",
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  search?: Record<string, unknown>;
  iconGradient?: string;
}) {
  const { totalItens } = useCart();
  const showCart = to === "/comercio";
  return (
    <SheetClose asChild>
      <Link
        to={to}
        search={search as any}
        className="relative flex items-center gap-3 pl-4 pr-4 py-3 rounded-[12px] text-text-secondary hover:bg-white/[0.04] transition-all border-l-[3px] border-transparent"
        activeProps={{
          className:
            "!bg-[rgba(124,58,237,0.15)] !text-text-primary font-semibold !border-l-[3px] !border-[#7c3aed]",
        }}
      >
        <span
          className={cn(
            "shrink-0 size-9 rounded-[10px] flex items-center justify-center text-white bg-gradient-to-br shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
            iconGradient,
          )}
        >
          {icon}
        </span>
        <span className="text-sm font-semibold flex-1 truncate">{label}</span>
        {showCart && totalItens > 0 && (
          <span className="size-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {totalItens}
          </span>
        )}
      </Link>
    </SheetClose>
  );
}



