import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
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

    return { 
      session, 
      profile 
    };
  },
  component: () => <Outlet />,
});
