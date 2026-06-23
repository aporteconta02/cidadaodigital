
CREATE POLICY "Driver uploads CNH" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cnh-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Driver le propria CNH" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cnh-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Admin le CNH" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cnh-docs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Driver atualiza CNH" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cnh-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Driver apaga CNH" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cnh-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
