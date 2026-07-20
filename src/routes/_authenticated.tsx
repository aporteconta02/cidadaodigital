import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/hooks/use-auth-store";

function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // SSR: never gate on server (no localStorage). Client will re-run.
    if (typeof window === "undefined") {
      return { session: null, profile: null };
    }

    // Ensure zustand store is hydrated from localStorage before reading it.
    try {
      await Promise.resolve(useAuthStore.persist.rehydrate());
    } catch {
      // ignore
    }

    const store = useAuthStore.getState();

    // Fast path: qualquer sessão persistida basta para deixar entrar.
    // Perfil e refresh de sessão acontecem em background — nunca bloqueiam a rota.
    if (store.session) {
      void (async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            useAuthStore.getState().setSession(data.session);
            const { data: profile } = await supabase
              .from("usuarios")
              .select("*")
              .eq("auth_id", data.session.user.id)
              .maybeSingle();
            if (profile) useAuthStore.getState().setProfile(profile as any);
          } else {
            // Sessão persistida ficou inválida: limpa store para próximo carregamento.
            useAuthStore.getState().logout();
          }
        } catch {
          // ignore background refresh errors
        }
      })();
      return { session: store.session, profile: store.profile };
    }

    // No persisted session -> check Supabase (may have just logged in).
    const sessionResult = await withTimeout(
      supabase.auth.getSession(),
      3000,
      { data: { session: null } } as any,
    );
    const session = sessionResult.data.session;

    if (!session) {
      store.logout();
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname + location.search },
      });
    }

    useAuthStore.getState().setSession(session);

    // Profile fetch is best-effort — never block routing on it.
    const profileResult = await withTimeout(
      supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", session.user.id)
        .maybeSingle(),
      3000,
      { data: null } as any,
    );
    const profile = profileResult.data;
    if (profile) useAuthStore.getState().setProfile(profile as any);

    return { session, profile };
  },
  component: () => <Outlet />,
});
