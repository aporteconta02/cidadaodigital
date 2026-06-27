
CREATE TABLE IF NOT EXISTS public.alerta_colaboracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alerta_id UUID NOT NULL REFERENCES public.alertas_seguranca(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('informacao','confirmacao','resolucao')),
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.alerta_colaboracoes TO authenticated;
GRANT ALL ON public.alerta_colaboracoes TO service_role;

ALTER TABLE public.alerta_colaboracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logados podem colaborar"
  ON public.alerta_colaboracoes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "autenticados podem ver colaboracoes"
  ON public.alerta_colaboracoes FOR SELECT TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_alerta_colaboracoes_alerta ON public.alerta_colaboracoes(alerta_id, created_at DESC);

ALTER TABLE public.alertas_seguranca ADD COLUMN IF NOT EXISTS resolvido BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.mark_alerta_resolvido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo = 'resolucao' THEN
    UPDATE public.alertas_seguranca SET resolvido = true, ativo = false WHERE id = NEW.alerta_id;
  ELSIF NEW.tipo = 'confirmacao' THEN
    UPDATE public.alertas_seguranca SET confirmacoes = COALESCE(confirmacoes,0) + 1 WHERE id = NEW.alerta_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_alerta_resolvido ON public.alerta_colaboracoes;
CREATE TRIGGER trg_mark_alerta_resolvido
  AFTER INSERT ON public.alerta_colaboracoes
  FOR EACH ROW EXECUTE FUNCTION public.mark_alerta_resolvido();

ALTER PUBLICATION supabase_realtime ADD TABLE public.alerta_colaboracoes;
