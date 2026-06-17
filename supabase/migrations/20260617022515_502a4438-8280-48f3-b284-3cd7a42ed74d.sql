
-- Trigger que bloqueia upgrade self-service de assinatura Plus
CREATE OR REPLACE FUNCTION public.prevent_self_plus_upgrade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Permite quando não há sessão JWT (chamadas internas do servidor / service_role / triggers)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Permite quando o ator é admin
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Para usuários comuns: bloquear mudanças nos campos sensíveis
  IF NEW.assinante_plus IS DISTINCT FROM OLD.assinante_plus
     OR NEW.validade_assinatura IS DISTINCT FROM OLD.validade_assinatura
     OR NEW.numero_membro IS DISTINCT FROM OLD.numero_membro
     OR NEW.qr_code_token IS DISTINCT FROM OLD.qr_code_token
     OR NEW.is_admin IS DISTINCT FROM OLD.is_admin
  THEN
    RAISE EXCEPTION 'Alteração não permitida: campos de assinatura/admin só podem ser modificados pelo servidor.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_plus_upgrade ON public.usuarios;
CREATE TRIGGER trg_prevent_self_plus_upgrade
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_plus_upgrade();
