
-- alertas_seguranca: remove loose INSERT policy
DROP POLICY IF EXISTS "Usuários podem criar alertas" ON public.alertas_seguranca;

-- eventos: remove duplicate INSERT policy that compared auth.uid() to usuarios.id
DROP POLICY IF EXISTS "Propor eventos" ON public.eventos;

-- denuncias: restrict SELECT to owner or admin
DROP POLICY IF EXISTS "Denúncias são públicas" ON public.denuncias;
DROP POLICY IF EXISTS "Qualquer um pode ver denúncias" ON public.denuncias;
DROP POLICY IF EXISTS "Anyone can view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Authenticated can view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Public can view denuncias" ON public.denuncias;
DROP POLICY IF EXISTS "Todos podem ver denúncias" ON public.denuncias;
DROP POLICY IF EXISTS "denuncias_select_all" ON public.denuncias;

-- Drop any other SELECT policy using true to be safe
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='denuncias' AND cmd='SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.denuncias', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Owner can view own denuncias"
ON public.denuncias
FOR SELECT
TO authenticated
USING (
  usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
);

CREATE POLICY "Admins can view all denuncias"
ON public.denuncias
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
