import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
    }

    // Fetch user profile to avoid redundant fetches in child routes
    const { data: profile, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile in guard:', error);
    }

    return { 
      session, 
      profile 
    };
  },
  component: () => <Outlet />,
});

