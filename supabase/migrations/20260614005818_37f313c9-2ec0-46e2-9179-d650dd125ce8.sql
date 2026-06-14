
-- Storage policies for fotos-produtos bucket
DO $$ BEGIN
  CREATE POLICY "Lojistas upload produto photos"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'fotos-produtos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Lojistas update produto photos"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'fotos-produtos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Lojistas delete produto photos"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'fotos-produtos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enable realtime on pedidos for store dashboard
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_pedido;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
