DROP POLICY IF EXISTS "Auth ve avaliacoes" ON public.ride_ratings;
CREATE POLICY "Envolvido ve avaliacao"
  ON public.ride_ratings FOR SELECT TO authenticated
  USING (
    avaliador_id = public.current_usuario_id()
    OR avaliado_id = public.current_usuario_id()
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Ver drivers aprovados" ON public.drivers;

CREATE OR REPLACE VIEW public.drivers_public
WITH (security_invoker = on) AS
  SELECT id, usuario_id, tipo_veiculo, modelo_veiculo,
         online, avaliacao_media, total_corridas, status_aprovacao
  FROM public.drivers
  WHERE status_aprovacao = 'aprovado';

GRANT SELECT ON public.drivers_public TO authenticated;