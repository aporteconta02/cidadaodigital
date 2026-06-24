
DROP POLICY IF EXISTS "Todos podem ver pesquisas ativas" ON public.pesquisas;
DROP POLICY IF EXISTS "pesquisas_select" ON public.pesquisas;

CREATE POLICY "Admins gerenciam pesquisas insert" ON public.pesquisas
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gerenciam pesquisas update" ON public.pesquisas
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gerenciam pesquisas delete" ON public.pesquisas
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
