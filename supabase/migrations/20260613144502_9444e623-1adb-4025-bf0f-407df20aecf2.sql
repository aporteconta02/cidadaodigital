
DROP POLICY IF EXISTS "denuncias_insert" ON public.denuncias;
DROP POLICY IF EXISTS "eventos_insert" ON public.eventos;

DROP POLICY IF EXISTS "lojas_insert_own" ON public.lojas;
CREATE POLICY "lojas_insert_own" ON public.lojas
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));

DROP POLICY IF EXISTS "pedidos_insert" ON public.pedidos;
CREATE POLICY "pedidos_insert" ON public.pedidos
  FOR INSERT TO authenticated
  WITH CHECK (comprador_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));
