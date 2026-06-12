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
import { Home, ShoppingBag, Users, ShieldAlert, User, Plus, Megaphone, Calendar, ClipboardList, AlertCircle } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
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
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&family=Space+Grotesk:wght@500;600;700&display=swap",
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
  const isPublicPage = ['/', '/auth'].includes(location.pathname);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        router.invalidate();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);


  return (
    <QueryClientProvider client={queryClient}>
      <div className={cn(
        "flex min-h-screen flex-col bg-bg-primary text-text-primary overflow-x-hidden font-jakarta",
        !isPublicPage && "pb-[72px]"
      )}>
        <Toaster position="top-center" expand={true} richColors />
        {/* App Header (Hidden on landing/auth) */}
        {!isPublicPage && (
          <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl px-6 py-5 border-b border-white/5">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <h1 className="text-xl font-bold tracking-tight text-primary font-display uppercase italic">
                CIDADÃO<span className="text-text-primary">.</span><span className="text-secondary">PLUS</span>
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-text-secondary font-space font-black leading-none mb-1 opacity-70">SÃO PAULO</span>
                  <span className="text-[11px] font-bold text-text-primary/90 uppercase tracking-wider">Jardim Paulista</span>
                </div>
                <div className="size-9 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center transition-transform active:scale-95 cursor-pointer">
                  <User size={18} className="text-text-secondary" />
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className={cn("flex-1 w-full", !isPublicPage && "max-w-lg mx-auto")}>
          <Outlet />
        </main>

        {/* Bottom Navigation (Hidden on landing/auth) */}
        {!isPublicPage && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-[20px] border-t border-white/5 pb-safe shadow-card">
            <div className="flex items-center justify-around bottom-nav-height max-w-lg mx-auto relative px-4">
              <NavLink to="/dashboard" icon={<Home size={22} />} label="Início" />
              <NavLink to="/comercio" icon={<ShoppingBag size={22} />} label="Mercado" />
              
              {/* Central Plus Button */}
              <Drawer>
                <DrawerTrigger asChild>
                  <button className="relative z-10 size-14 rounded-full bg-gradient-hero -translate-y-4 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(108,99,255,0.5)] active:scale-90 transition-transform cursor-pointer">
                    <Plus size={28} strokeWidth={3} />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="bg-bg-elevated border-border-custom max-w-lg mx-auto rounded-t-3xl">
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <ActionButton icon={<Megaphone className="text-primary" />} label="Fazer Denúncia" />
                    <ActionButton icon={<Calendar className="text-secondary" />} label="Criar Evento" />
                    <ActionButton icon={<ClipboardList className="text-success" />} label="Publicar Aviso" />
                    <ActionButton icon={<AlertCircle className="text-danger" />} label="Reportar Alerta" />
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
              <NavLink to="/perfil" icon={<User size={22} />} label="Perfil" />
            </div>
          </nav>
        )}
      </div>
    </QueryClientProvider>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center gap-1 group relative py-2 w-14"
      activeProps={{ className: "text-primary active-link" }}
      inactiveProps={{ className: "text-text-muted" }}
    >
      <div className="transition-all group-active:scale-90">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight hidden group-[.active-link]:block">
        {label}
      </span>
      
      {/* Active Indicator Point */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 transition-opacity group-[.active-link]:opacity-100" />
    </Link>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 active:scale-95 transition-all hover:bg-white/10">
      <div className="size-12 rounded-full bg-bg-primary flex items-center justify-center shadow-card">
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 24 })}
      </div>
      <span className="micro-text font-bold text-text-primary uppercase tracking-wider text-center">
        {label}
      </span>
    </button>
  );
}

