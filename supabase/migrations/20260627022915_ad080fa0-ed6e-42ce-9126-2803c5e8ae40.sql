
CREATE TABLE IF NOT EXISTS public.solicitacoes_eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome_evento TEXT NOT NULL,
  data_evento TIMESTAMPTZ,
  local TEXT,
  descricao TEXT,
  contato TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.solicitacoes_eventos TO authenticated;
GRANT ALL ON public.solicitacoes_eventos TO service_role;

ALTER TABLE public.solicitacoes_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuario cria solicitacao"
  ON public.solicitacoes_eventos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuario ve suas solicitacoes"
  ON public.solicitacoes_eventos
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin atualiza solicitacoes"
  ON public.solicitacoes_eventos
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_solicitacoes_eventos_updated_at
  BEFORE UPDATE ON public.solicitacoes_eventos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
