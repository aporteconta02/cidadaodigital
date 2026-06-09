import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createIncident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { type: string; title: string; description: string; lat?: number; lng?: number }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: incident, error } = await supabase
      .from("incidents")
      .insert({
        user_id: userId,
        type: data.type,
        title: data.title,
        description: data.description,
        location_lat: data.lat,
        location_lng: data.lng,
      })
      .select()
      .single();

    if (error) throw error;
    return { incident };
  });

export const getIncidents = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: incidents, error } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { incidents };
  });
