
DROP POLICY IF EXISTS "Users can manage their own incidents" ON public.incidents;
CREATE POLICY "Users can manage their own incidents" ON public.incidents
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own profiles" ON public.profiles;
CREATE POLICY "Users can manage their own profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário vê suas próprias respostas" ON public.respostas_pesquisa;
CREATE POLICY "Usuário vê suas próprias respostas" ON public.respostas_pesquisa
  FOR SELECT TO authenticated
  USING (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));
