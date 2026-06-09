import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    console.log("Checking auth in _authenticated layout...");
    const { data, error } = await supabase.auth.getUser();
    console.log("Auth result:", { user: data.user?.id, error });
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },

  component: () => <Outlet />,
});
