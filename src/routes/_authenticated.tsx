import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

import { useAuthStore } from "@/hooks/use-auth-store";

// Fail-safe: never let a hung network call keep the app on a blank router-pending
// screen. If getSession()/profile fetch doesn't resolve fast, fall back and let
// the AuthProvider re-hydrate on the client.
function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Skip on the server — no localStorage, no session. Client re-runs.
    if (typeof window === "undefined") {
      return { session: null, profile: null };
    }

    const sessionResult = await withTimeout(
      supabase.auth.getSession(),
      2500,
      { data: { session: null } } as any,
    );
    let session = sessionResult.data.session;

    if (!session) {
      // Brief retry to handle post-login race
      await new Promise((r) => setTimeout(r, 120));
      const retry = await withTimeout(
        supabase.auth.getSession(),
        1500,
        { data: { session: null } } as any,
      );
      session = retry.data.session;
    }

    if (!session) {
      const { logout } = useAuthStore.getState();
      logout();
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname + location.search },
      });
    }

    // Profile fetch is best-effort — never block routing on it.
    const profileResult = await withTimeout(
      supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", session.user.id)
        .maybeSingle(),
      2500,
      { data: null, error: null } as any,
    );
    const profile = profileResult.data;

    const { setProfile, setSession } = useAuthStore.getState();
    setSession(session);
    if (profile) setProfile(profile as any);

    return { session, profile };
  },
  component: () => <Outlet />,
});
