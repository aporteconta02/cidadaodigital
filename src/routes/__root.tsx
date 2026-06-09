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
import { useEffect, type ReactNode } from "react";
import { Home, ShoppingBag, Users, ShieldAlert, User } from "lucide-react";
import { cn } from "@/lib/utils";


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
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Syne:wght@400..800&display=swap",
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
  const location = useLocation();
  const isPublicPage = ['/', '/auth'].includes(location.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={cn(
        "flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden font-body",
        !isPublicPage && "pb-24"
      )}>
        {/* App Header (Hidden on landing/auth) */}
        {!isPublicPage && (
          <header className="sticky top-0 z-40 bg-gradient-to-br from-[#080C18] to-[#0A1628] px-6 py-6 border-b border-white/5">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <h1 className="text-2xl font-black tracking-tighter text-primary font-display uppercase">
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
        )}

        {/* Main Content Area */}
        <main className={cn("flex-1 w-full", !isPublicPage && "max-w-lg mx-auto")}>
          <Outlet />
        </main>

        {/* Bottom Navigation (Hidden on landing/auth) */}
        {!isPublicPage && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 pb-safe">
            <div className="flex items-center justify-around h-20 max-w-lg mx-auto relative px-2">
              <NavLink to="/dashboard" icon={<Home size={22} />} label="Início" />
              <NavLink to="/comercio" icon={<ShoppingBag size={22} />} label="Loja" />
              
              {/* SOS Central Button */}
              <div className="relative -top-6 flex flex-col items-center">
                <Link 
                  to="/sos"
                  className="sos-pulse size-16 rounded-full bg-sos flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,45,45,0.4)] hover:scale-105 active:scale-95 transition-transform"
                >
                  <ShieldAlert size={32} strokeWidth={2.5} />
                </Link>
                <span className="text-[10px] font-bold mt-1 text-sos uppercase tracking-wider">SOS</span>
              </div>

              <NavLink to="/comunidade" icon={<Users size={22} />} label="Povo" />
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

