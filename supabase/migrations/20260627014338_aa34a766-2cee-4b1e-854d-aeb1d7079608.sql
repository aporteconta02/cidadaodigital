
ALTER TABLE public.alertas_seguranca
  ADD COLUMN IF NOT EXISTS arquivado_em TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS visivel_ate TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS total_colaboracoes INTEGER NOT NULL DEFAULT 0;

-- Backfill visivel_ate para alertas existentes (criado_em + 48h)
UPDATE public.alertas_seguranca
SET visivel_ate = criado_em + INTERVAL '48 hours'
WHERE visivel_ate IS NULL;

-- Backfill total_colaboracoes a partir de alerta_colaboracoes
UPDATE public.alertas_seguranca a
SET total_colaboracoes = sub.cnt
FROM (SELECT alerta_id, COUNT(*)::int AS cnt FROM public.alerta_colaboracoes GROUP BY alerta_id) sub
WHERE sub.alerta_id = a.id;

-- Trigger: define visivel_ate ao inserir
CREATE OR REPLACE FUNCTION public.set_alerta_visivel_ate()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.visivel_ate IS NULL THEN
    NEW.visivel_ate := COALESCE(NEW.criado_em, now()) + INTERVAL '48 hours';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_alerta_visivel_ate ON public.alertas_seguranca;
CREATE TRIGGER trg_set_alerta_visivel_ate
  BEFORE INSERT ON public.alertas_seguranca
  FOR EACH ROW EXECUTE FUNCTION public.set_alerta_visivel_ate();

-- Atualizar trigger de colaborações para incrementar total_colaboracoes
CREATE OR REPLACE FUNCTION public.mark_alerta_resolvido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.alertas_seguranca
  SET total_colaboracoes = COALESCE(total_colaboracoes, 0) + 1
  WHERE id = NEW.alerta_id;

  IF NEW.tipo = 'resolucao' THEN
    UPDATE public.alertas_seguranca SET resolvido = true, ativo = false WHERE id = NEW.alerta_id;
  ELSIF NEW.tipo = 'confirmacao' THEN
    UPDATE public.alertas_seguranca SET confirmacoes = COALESCE(confirmacoes,0) + 1 WHERE id = NEW.alerta_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Índice para filtros do mapa
CREATE INDEX IF NOT EXISTS idx_alertas_visivel_ate ON public.alertas_seguranca(visivel_ate) WHERE arquivado_em IS NULL;

-- Habilitar extensões para cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar job que arquiva alertas expirados a cada hora
SELECT cron.unschedule('arquivar-alertas-expirados') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'arquivar-alertas-expirados');

SELECT cron.schedule(
  'arquivar-alertas-expirados',
  '0 * * * *',
  $$
  UPDATE public.alertas_seguranca
  SET arquivado_em = now(), ativo = false
  WHERE visivel_ate < now() AND arquivado_em IS NULL;
  $$
);
