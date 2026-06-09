import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const UserSchema = z.object({
  nome: z.string().min(3),
  telefone: z.string(),
  cidade: z.string(),
  bairro: z.string(),
  tipo: z.enum(['morador', 'comerciante', 'entregador']),
});

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("auth_id", userId)
      .maybeSingle();

    if (error) throw error;
    return { profile: data };
  });

export const createProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => UserSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    
    if (!claims.email) throw new Error("Email do usuário não disponível");

    const { data: profile, error } = await supabase
      .from("usuarios")
      .insert({
        auth_id: userId,
        email: claims.email,
        ...data,
      })
      .select()
      .single();


    if (error) throw error;
    return { profile };
  });
