import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

import { useAuthStore } from "@/hooks/use-auth-store";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // On the server, we might not have the session in the singleton client
    // because it relies on localStorage which isn't available on the server.
    // We skip the redirect on the server and let the client-side execution handle it.
    if (typeof window === 'undefined') {
      return { session: null, profile: null };
    }

    console.log("Checking authentication for path:", location.pathname);
    
    // Attempt to get session
    let { data: { session } } = await supabase.auth.getSession();
    
    // If no session, wait a brief moment and try once more (handles race conditions after login)
    if (!session) {
      console.log("Session not found immediately, retrying in 100ms...");
      await new Promise(resolve => setTimeout(resolve, 100));
      const retry = await supabase.auth.getSession();
      session = retry.data.session;
    }
    
    if (!session) {
      console.log("Authentication failed, redirecting to /auth");
      // Limpar estado se a sessão caiu
      if (typeof window !== 'undefined') {
        const { logout } = useAuthStore.getState();
        logout();
      }
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.pathname + location.search,
        },
      });
    }

    console.log("Authenticated as:", session.user.email);

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile in guard:', error);
    }

    // Atualizar store global se no cliente
    if (typeof window !== 'undefined' && profile) {
      const { setProfile, setSession } = useAuthStore.getState();
      setProfile(profile as any);
      setSession(session);
    }

    return { 
      session, 
      profile 
    };
  },
  component: () => <Outlet />,
});
