-- 1. RESPOSTAS DAS PESQUISAS (Ajustando nome conforme pedido e adicionando campo bairro)
-- Nota: A migração anterior criou 'respostas_pesquisas', vamos garantir que o nome siga a especificação do usuário ou substituir.
DROP TABLE IF EXISTS public.respostas_pesquisas;

CREATE TABLE public.respostas_pesquisa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pesquisa_id UUID NOT NULL REFERENCES public.pesquisas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  resposta JSONB NOT NULL,
  bairro TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pesquisa_id, usuario_id)
);

GRANT SELECT, INSERT ON public.respostas_pesquisa TO authenticated;
GRANT ALL ON public.respostas_pesquisa TO service_role;
ALTER TABLE public.respostas_pesquisa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias respostas" ON public.respostas_pesquisa
  FOR SELECT TO authenticated USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE id = usuario_id));

CREATE POLICY "Usuários podem responder pesquisas" ON public.respostas_pesquisa
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE id = usuario_id));

-- 2. CLUBE DE BENEFÍCIOS (PARCEIROS)
CREATE TABLE public.parceiros_clube (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  desconto_percentual INTEGER,
  descricao_beneficio TEXT,
  ativo BOOLEAN DEFAULT true
);

GRANT SELECT ON public.parceiros_clube TO anon, authenticated;
GRANT ALL ON public.parceiros_clube TO service_role;
ALTER TABLE public.parceiros_clube ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver benefícios ativos" ON public.parceiros_clube
  FOR SELECT TO anon, authenticated USING (ativo = true);

-- 3. VALIDAÇÕES DO QR CODE
CREATE TABLE public.validacoes_qr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validador_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  resultado TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.validacoes_qr TO authenticated;
GRANT ALL ON public.validacoes_qr TO service_role;
ALTER TABLE public.validacoes_qr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Validadores e membros podem ver seus registros" ON public.validacoes_qr
  FOR SELECT TO authenticated USING (
    auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE id IN (validador_id, membro_id))
  );

CREATE POLICY "Apenas usuários autorizados podem registrar validações" ON public.validacoes_qr
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE id = validador_id)
  );