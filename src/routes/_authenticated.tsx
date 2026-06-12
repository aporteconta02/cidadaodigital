import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    console.log("Checking authentication for path:", location.pathname);
    
    // First check session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No session found, redirecting to /auth");
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
    }

    console.log("Session found for user:", session.user.id);

    // Verify user (more secure than getSession)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log("User verification failed, redirecting to /auth");
      throw redirect({
        to: "/auth",
      });
    }

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile in guard:', error);
    }

    if (!profile) {
      console.log("No profile found for user:", user.id);
      // We don't necessarily want to redirect to login if profile is missing, 
      // but maybe we should redirect to a "complete profile" page if it's required.
      // For now, let's just let them through and child routes can handle missing profiles.
    }

    return { 
      session, 
      profile 
    };
  },
  component: () => <Outlet />,
});

