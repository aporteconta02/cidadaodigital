
-- 1) respostas_pesquisa: replace open SELECT with owner-only + admin
DROP POLICY IF EXISTS "Autenticados podem ver respostas" ON public.respostas_pesquisa;

CREATE POLICY "Usuário vê suas próprias respostas"
  ON public.respostas_pesquisa FOR SELECT
  TO authenticated
  USING (usuario_id = public.current_usuario_id());

CREATE POLICY "Admins veem todas as respostas"
  ON public.respostas_pesquisa FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) lojas: drop redundant broad active-store SELECT (lojas_select_approved already restricts to approved or own)
DROP POLICY IF EXISTS "Qualquer autenticado vê lojas ativas" ON public.lojas;

-- 3) Fix mutable search_path on remaining functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.validate_offer_request_open() SET search_path = public;
