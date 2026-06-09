-- 1. CONTATOS DE CONFIANÇA
CREATE TABLE public.contatos_confianca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contatos_confianca TO authenticated;
GRANT ALL ON public.contatos_confianca TO service_role;
ALTER TABLE public.contatos_confianca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus próprios contatos" ON public.contatos_confianca
  FOR ALL TO authenticated USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE id = usuario_id));

-- 2. TELEFONES ÚTEIS
CREATE TABLE public.telefones_uteis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cidade TEXT,
  destaque BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0
);

GRANT SELECT ON public.telefones_uteis TO anon, authenticated;
GRANT ALL ON public.telefones_uteis TO service_role;
ALTER TABLE public.telefones_uteis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver telefones úteis" ON public.telefones_uteis
  FOR SELECT TO anon, authenticated USING (true);

-- 3. BANNERS
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID REFERENCES public.lojas(id) ON DELETE SET NULL,
  titulo TEXT,
  imagem_url TEXT NOT NULL,
  link_destino TEXT,
  posicao INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  data_inicio DATE,
  data_fim DATE,
  criado_em TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver banners ativos" ON public.banners
  FOR SELECT TO anon, authenticated USING (ativo = true);

-- 4. MURAL DE AVISOS
CREATE TABLE public.mural_avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('pets','emprego','venda','alerta','geral')),
  titulo TEXT NOT NULL,
  texto TEXT NOT NULL,
  foto_url TEXT,
  bairro TEXT,
  cidade TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mural_avisos TO authenticated;
GRANT SELECT ON public.mural_avisos TO anon;
GRANT ALL ON public.mural_avisos TO service_role;
ALTER TABLE public.mural_avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver avisos ativos" ON public.mural_avisos
  FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE POLICY "Usuários podem gerenciar seus próprios avisos" ON public.mural_avisos
  FOR ALL TO authenticated USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE id = usuario_id));

-- 5. VOZ DO POVO (PESQUISAS)
CREATE TABLE public.pesquisas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('politica','infraestrutura','saude','educacao','seguranca','transporte','geral')),
  tipo TEXT NOT NULL CHECK (tipo IN ('unica','multipla','escala','texto')),
  opcoes JSONB,
  cidade TEXT,
  ativa BOOLEAN DEFAULT true,
  encerra_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.pesquisas TO anon, authenticated;
GRANT ALL ON public.pesquisas TO service_role;
ALTER TABLE public.pesquisas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver pesquisas ativas" ON public.pesquisas
  FOR SELECT TO anon, authenticated USING (ativa = true);

-- 6. RESPOSTAS DE PESQUISAS (Tabela necessária para as pesquisas funcionarem)
CREATE TABLE public.respostas_pesquisas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pesquisa_id UUID NOT NULL REFERENCES public.pesquisas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  resposta JSONB NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pesquisa_id, usuario_id)
);

GRANT SELECT, INSERT ON public.respostas_pesquisas TO authenticated;
GRANT ALL ON public.respostas_pesquisas TO service_role;
ALTER TABLE public.respostas_pesquisas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias respostas" ON public.respostas_pesquisas
  FOR SELECT TO authenticated USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE id = usuario_id));

CREATE POLICY "Usuários podem responder pesquisas" ON public.respostas_pesquisas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE id = usuario_id));