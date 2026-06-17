import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Ativa a assinatura Plus do usuário autenticado.
 *
 * ⚠️ DEMO: este endpoint hoje ativa a assinatura sem verificação de pagamento.
 * Em produção, substituir por um webhook do gateway de pagamento.
 *
 * A escrita usa supabaseAdmin para contornar o trigger
 * `prevent_self_plus_upgrade`, garantindo que somente o servidor possa
 * marcar `assinante_plus=true`.
 */
export const activatePlusSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: user, error: uErr } = await supabase
      .from("usuarios")
      .select("id, numero_membro, qr_code_token")
      .eq("auth_id", userId)
      .maybeSingle();

    if (uErr || !user) throw new Error("Perfil não encontrado");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const validade = new Date();
    validade.setDate(validade.getDate() + 30);

    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .update({
        assinante_plus: true,
        validade_assinatura: validade.toISOString(),
        numero_membro: user.numero_membro || `MBR${Math.floor(Math.random() * 90000) + 10000}`,
        qr_code_token: user.qr_code_token || crypto.randomUUID(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return { ok: true, profile: data };
  });
