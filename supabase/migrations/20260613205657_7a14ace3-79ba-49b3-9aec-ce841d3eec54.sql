
ALTER TABLE public.alertas_seguranca
  ADD COLUMN IF NOT EXISTS observacao_resolucao text,
  ADD COLUMN IF NOT EXISTS resolvido_em timestamptz;

ALTER TABLE public.denuncias
  ADD COLUMN IF NOT EXISTS observacao_resolucao text,
  ADD COLUMN IF NOT EXISTS resolvido_em timestamptz;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='denuncias' AND policyname='denuncias_update_own'
  ) THEN
    CREATE POLICY "denuncias_update_own" ON public.denuncias
      FOR UPDATE TO authenticated
      USING (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()))
      WITH CHECK (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));
  END IF;
END $$;
