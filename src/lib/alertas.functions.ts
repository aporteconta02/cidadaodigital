import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const AlertSchema = z.object({
  tipo: z.enum(['suspeito', 'perturbacao', 'acidente', 'crime', 'sos']),
  descricao: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  bairro: z.string().optional(),
});

export const getActiveAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("alertas_seguranca")
      .select(`
        *,
        usuarios (nome, avatar_url)
      `)
      .eq("ativo", true)
      .gt("expira_em", new Date().toISOString())
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return { alerts: data };
  });

export const createSecurityAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => AlertSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    
    // Obter ID do usuário interno
    const { data: user } = await supabase
      .from("usuarios")
      .select("id")
      .eq("auth_id", userId)
      .single();

    if (!user) throw new Error("Perfil não encontrado");

    const { data: alert, error } = await supabase
      .from("alertas_seguranca")
      .insert({
        usuario_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return { alert };
  });
