-- Ajustar função com search_path por segurança
CREATE OR REPLACE FUNCTION public.increment_confirmacoes(alert_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.alertas_seguranca
  SET confirmacoes = COALESCE(confirmacoes, 0) + 1
  WHERE id = alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revogar permissões públicas caso existam
REVOKE EXECUTE ON FUNCTION public.increment_confirmacoes(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_confirmacoes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_confirmacoes(UUID) TO service_role;
