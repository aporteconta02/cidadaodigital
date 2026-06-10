ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_insert_own" ON public.usuarios;
CREATE POLICY "usuarios_insert_own" ON public.usuarios
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own" ON public.usuarios
FOR SELECT TO authenticated
USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "lojas_insert_own" ON public.lojas;
CREATE POLICY "lojas_insert_own" ON public.lojas
FOR INSERT TO authenticated
WITH CHECK (true);