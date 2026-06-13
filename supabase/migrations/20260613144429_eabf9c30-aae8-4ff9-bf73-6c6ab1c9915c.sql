
-- USUARIOS: remove permissive policies, prevent admin escalation
DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON public.usuarios;
DROP POLICY IF EXISTS "Merchants can read profiles by QR token" ON public.usuarios;

CREATE POLICY "usuarios_insert_self_no_admin" ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid() AND COALESCE(is_admin, false) = false);

-- Prevent users from elevating themselves to admin via UPDATE
DROP POLICY IF EXISTS "usuarios_update_own" ON public.usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio registro" ON public.usuarios;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.usuarios;

CREATE POLICY "usuarios_update_own_no_admin" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid() AND COALESCE(is_admin, false) = (SELECT COALESCE(u.is_admin, false) FROM public.usuarios u WHERE u.auth_id = auth.uid()));

-- MURAL_AVISOS: drop permissive insert
DROP POLICY IF EXISTS "mural_insert" ON public.mural_avisos;

-- RESPOSTAS_PESQUISA: drop overly permissive policies
DROP POLICY IF EXISTS "respostas_select" ON public.respostas_pesquisa;
DROP POLICY IF EXISTS "respostas_insert_once" ON public.respostas_pesquisa;

-- ALERTAS_SEGURANCA: fix broken update policy and drop permissive select
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios alertas" ON public.alertas_seguranca;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver alertas" ON public.alertas_seguranca;

CREATE POLICY "alertas_update_own" ON public.alertas_seguranca
  FOR UPDATE TO authenticated
  USING (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()))
  WITH CHECK (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));

-- ITENS_PEDIDO: restrict roles to authenticated and add INSERT policy
DROP POLICY IF EXISTS "Comprador vê itens dos seus pedidos" ON public.itens_pedido;
DROP POLICY IF EXISTS "Lojista vê itens dos pedidos da sua loja" ON public.itens_pedido;

CREATE POLICY "itens_pedido_select_buyer" ON public.itens_pedido
  FOR SELECT TO authenticated
  USING (pedido_id IN (
    SELECT p.id FROM public.pedidos p
    WHERE p.comprador_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
  ));

CREATE POLICY "itens_pedido_select_seller" ON public.itens_pedido
  FOR SELECT TO authenticated
  USING (pedido_id IN (
    SELECT p.id FROM public.pedidos p
    WHERE p.loja_id IN (
      SELECT l.id FROM public.lojas l
      WHERE l.usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
    )
  ));

CREATE POLICY "itens_pedido_insert_buyer" ON public.itens_pedido
  FOR INSERT TO authenticated
  WITH CHECK (pedido_id IN (
    SELECT p.id FROM public.pedidos p
    WHERE p.comprador_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
  ));

-- STORAGE: tighten avatares INSERT to user-owned folder, add DELETE policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;

CREATE POLICY "Users upload own avatar path" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatares'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatares' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own denuncia photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'fotos-denuncias' AND owner = auth.uid());

-- Tighten denuncia upload to authenticated and set owner
DROP POLICY IF EXISTS "Users can upload denuncia photos" ON storage.objects;
CREATE POLICY "Users upload denuncia photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos-denuncias');

-- Revoke anon execute on SECURITY DEFINER functions (keep authenticated where required by app)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.increment_confirmacoes(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_confirmacoes(uuid) TO authenticated;
