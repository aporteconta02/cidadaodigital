-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA USUARIOS (Extensão do auth.users)
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('morador','comerciante','entregador')),
  assinante_plus BOOLEAN DEFAULT false,
  numero_membro TEXT UNIQUE,
  validade_assinatura DATE,
  qr_code_token TEXT UNIQUE,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_auth_user FOREIGN KEY (auth_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 2. TABELA LOJAS
CREATE TABLE public.lojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  banner_url TEXT,
  telefone TEXT,
  endereco TEXT,
  aprovada BOOLEAN DEFAULT false,
  destaque BOOLEAN DEFAULT false,
  plano TEXT DEFAULT 'gratuito' CHECK (plano IN ('gratuito','premium')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA PRODUTOS
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  foto_url TEXT,
  estoque INTEGER DEFAULT 0,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 4. TABELA PEDIDOS
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','confirmado','preparando','saiu','entregue','cancelado')),
  tipo_entrega TEXT CHECK (tipo_entrega IN ('retirada','entrega')),
  total DECIMAL(10,2) NOT NULL,
  endereco_entrega TEXT,
  observacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 5. TABELA ITENS_PEDIDO
CREATE TABLE public.itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL
);

-- 6. TABELA DENUNCIAS
CREATE TABLE public.denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  foto_url TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  endereco TEXT,
  status TEXT DEFAULT 'enviada' CHECK (status IN ('enviada','em_analise','resolvida','rejeitada')),
  confirmacoes INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 7. TABELA EVENTOS
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMPTZ NOT NULL,
  local_nome TEXT,
  endereco TEXT,
  banner_url TEXT,
  categoria TEXT,
  gratuito BOOLEAN DEFAULT true,
  preco_ingresso DECIMAL(10,2),
  aprovado BOOLEAN DEFAULT false,
  destaque BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 8. TABELA ALERTAS_SEGURANCA
CREATE TABLE public.alertas_seguranca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('suspeito','perturbacao','acidente','crime','sos')),
  descricao TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  bairro TEXT,
  confirmacoes INTEGER DEFAULT 0,
  expira_em TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- GRANTs para PostgREST
GRANT SELECT, INSERT, UPDATE ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;

GRANT SELECT ON public.lojas TO authenticated;
GRANT ALL ON public.lojas TO service_role;
GRANT INSERT, UPDATE ON public.lojas TO authenticated; -- Lojistas podem criar/editar

GRANT SELECT ON public.produtos TO authenticated;
GRANT ALL ON public.produtos TO service_role;
GRANT INSERT, UPDATE ON public.produtos TO authenticated;

GRANT SELECT, INSERT ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;
GRANT UPDATE ON public.pedidos TO authenticated; -- Para atualizar status

GRANT SELECT, INSERT ON public.itens_pedido TO authenticated;
GRANT ALL ON public.itens_pedido TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.denuncias TO authenticated;
GRANT ALL ON public.denuncias TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.eventos TO authenticated;
GRANT ALL ON public.eventos TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.alertas_seguranca TO authenticated;
GRANT ALL ON public.alertas_seguranca TO service_role;

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_seguranca ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Usuarios
CREATE POLICY "Usuários podem ver seu próprio registro" ON public.usuarios FOR SELECT TO authenticated USING (auth.uid() = auth_id);
CREATE POLICY "Usuários podem atualizar seu próprio registro" ON public.usuarios FOR UPDATE TO authenticated USING (auth.uid() = auth_id);

-- Lojas (Públicas para leitura, protegidas para escrita)
CREATE POLICY "Qualquer autenticado vê lojas ativas" ON public.lojas FOR SELECT TO authenticated USING (ativo = true);
CREATE POLICY "Dono gerencia sua própria loja" ON public.lojas FOR ALL TO authenticated USING (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));

-- Produtos
CREATE POLICY "Qualquer autenticado vê produtos ativos" ON public.produtos FOR SELECT TO authenticated USING (ativo = true);
CREATE POLICY "Lojista gerencia seus produtos" ON public.produtos FOR ALL TO authenticated USING (loja_id IN (SELECT id FROM public.lojas WHERE usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())));

-- Pedidos
CREATE POLICY "Comprador vê seus pedidos" ON public.pedidos FOR SELECT TO authenticated USING (comprador_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "Lojista vê pedidos da sua loja" ON public.pedidos FOR SELECT TO authenticated USING (loja_id IN (SELECT id FROM public.lojas WHERE usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())));

-- Denuncias
CREATE POLICY "Usuários veem todas as denúncias" ON public.denuncias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários criam denúncias" ON public.denuncias FOR INSERT TO authenticated WITH CHECK (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));

-- Eventos
CREATE POLICY "Qualquer autenticado vê eventos aprovados" ON public.eventos FOR SELECT TO authenticated USING (aprovado = true);
CREATE POLICY "Usuários criam eventos" ON public.eventos FOR INSERT TO authenticated WITH CHECK (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));

-- Alertas
CREATE POLICY "Qualquer autenticado vê alertas ativos" ON public.alertas_seguranca FOR SELECT TO authenticated USING (ativo = true AND expira_em > now());
CREATE POLICY "Usuários criam alertas" ON public.alertas_seguranca FOR INSERT TO authenticated WITH CHECK (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));
