
-- 1. fotos-denuncias: restrict INSERT to user's own folder (usuarios.id matching auth.uid via auth_id)
DROP POLICY IF EXISTS "Users upload denuncia photos" ON storage.objects;
CREATE POLICY "Users upload denuncia photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'fotos-denuncias'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.usuarios WHERE auth_id = auth.uid()
    )
  );

-- 2. fotos-produtos: restrict INSERT to paths that match a loja owned by the caller
DROP POLICY IF EXISTS "Lojistas upload produto photos" ON storage.objects;
CREATE POLICY "Lojistas upload produto photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'fotos-produtos'
    AND (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM public.lojas l
      JOIN public.usuarios u ON u.id = l.usuario_id
      WHERE u.auth_id = auth.uid()
    )
  );

-- 3. fotos-produtos: restrict UPDATE/DELETE to owner's own lojas
DROP POLICY IF EXISTS "Lojistas update produto photos" ON storage.objects;
CREATE POLICY "Lojistas update produto photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'fotos-produtos'
    AND (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM public.lojas l
      JOIN public.usuarios u ON u.id = l.usuario_id
      WHERE u.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'fotos-produtos'
    AND (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM public.lojas l
      JOIN public.usuarios u ON u.id = l.usuario_id
      WHERE u.auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Lojistas delete produto photos" ON storage.objects;
CREATE POLICY "Lojistas delete produto photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'fotos-produtos'
    AND (storage.foldername(name))[1] IN (
      SELECT l.id::text FROM public.lojas l
      JOIN public.usuarios u ON u.id = l.usuario_id
      WHERE u.auth_id = auth.uid()
    )
  );

-- 4. banners bucket: admin-only write policies
CREATE POLICY "Admins upload banners"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update banners"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete banners"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

-- 5. respostas_pesquisa: remove broken policies that compare auth.uid() directly to usuario_id
DROP POLICY IF EXISTS "Votar em pesquisas" ON public.respostas_pesquisa;
DROP POLICY IF EXISTS "Ver suas proprias respostas" ON public.respostas_pesquisa;
