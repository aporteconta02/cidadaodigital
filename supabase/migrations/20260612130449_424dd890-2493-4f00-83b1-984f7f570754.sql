-- Drop existing policies if any to avoid conflicts
DO $$ 
BEGIN
    -- Usuarios
    DROP POLICY IF EXISTS "usuarios_select" ON usuarios;
    DROP POLICY IF EXISTS "usuarios_insert" ON usuarios;
    DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;
    
    -- Lojas
    DROP POLICY IF EXISTS "lojas_select_approved" ON lojas;
    DROP POLICY IF EXISTS "lojas_insert_own" ON lojas;
    DROP POLICY IF EXISTS "lojas_update_own" ON lojas;
    
    -- Produtos
    DROP POLICY IF EXISTS "produtos_select" ON produtos;
    DROP POLICY IF EXISTS "produtos_insert_owner" ON produtos;
    DROP POLICY IF EXISTS "produtos_update_owner" ON produtos;
    
    -- Pedidos
    DROP POLICY IF EXISTS "pedidos_select_own" ON pedidos;
    DROP POLICY IF EXISTS "pedidos_insert" ON pedidos;
    DROP POLICY IF EXISTS "pedidos_update_loja" ON pedidos;
    
    -- Denuncias
    DROP POLICY IF EXISTS "denuncias_select_all" ON denuncias;
    DROP POLICY IF EXISTS "denuncias_insert" ON denuncias;
    
    -- Alertas
    DROP POLICY IF EXISTS "alertas_select_assinantes" ON alertas_seguranca;
    DROP POLICY IF EXISTS "alertas_insert_assinantes" ON alertas_seguranca;
    
    -- Pesquisas
    DROP POLICY IF EXISTS "pesquisas_select" ON pesquisas;
    DROP POLICY IF EXISTS "respostas_select" ON respostas_pesquisa;
    DROP POLICY IF EXISTS "respostas_insert_once" ON respostas_pesquisa;
    
    -- Eventos
    DROP POLICY IF EXISTS "eventos_select" ON eventos;
    DROP POLICY IF EXISTS "eventos_insert" ON eventos;
    
    -- Mural
    DROP POLICY IF EXISTS "mural_select" ON mural_avisos;
    DROP POLICY IF EXISTS "mural_insert" ON mural_avisos;
    
    -- Banners
    DROP POLICY IF EXISTS "banners_select" ON banners;
    
    -- Telefones
    DROP POLICY IF EXISTS "telefones_select" ON telefones_uteis;
    
    -- Contatos
    DROP POLICY IF EXISTS "contatos_own" ON contatos_confianca;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- USUARIOS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.usuarios TO authenticated;
CREATE POLICY "usuarios_select" ON public.usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "usuarios_insert" ON public.usuarios FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "usuarios_update_own" ON public.usuarios FOR UPDATE TO authenticated USING (auth.uid() = auth_id);

-- LOJAS
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.lojas TO authenticated;
CREATE POLICY "lojas_select_approved" ON public.lojas FOR SELECT TO authenticated USING (aprovada = true OR usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "lojas_insert_own" ON public.lojas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lojas_update_own" ON public.lojas FOR UPDATE TO authenticated USING (usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));

-- PRODUTOS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.produtos TO authenticated;
CREATE POLICY "produtos_select" ON public.produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "produtos_insert_owner" ON public.produtos FOR INSERT TO authenticated WITH CHECK (loja_id IN (SELECT id FROM public.lojas WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())));
CREATE POLICY "produtos_update_owner" ON public.produtos FOR UPDATE TO authenticated USING (loja_id IN (SELECT id FROM public.lojas WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())));

-- PEDIDOS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.pedidos TO authenticated;
CREATE POLICY "pedidos_select_own" ON public.pedidos FOR SELECT TO authenticated USING (comprador_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()) OR loja_id IN (SELECT id FROM public.lojas WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())));
CREATE POLICY "pedidos_insert" ON public.pedidos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pedidos_update_loja" ON public.pedidos FOR UPDATE TO authenticated USING (loja_id IN (SELECT id FROM public.lojas WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())));

-- DENUNCIAS
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.denuncias TO authenticated;
CREATE POLICY "denuncias_select_all" ON public.denuncias FOR SELECT TO authenticated USING (true);
CREATE POLICY "denuncias_insert" ON public.denuncias FOR INSERT TO authenticated WITH CHECK (true);

-- ALERTAS (só assinantes)
ALTER TABLE public.alertas_seguranca ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.alertas_seguranca TO authenticated;
CREATE POLICY "alertas_select_assinantes" ON public.alertas_seguranca FOR SELECT TO authenticated USING ((SELECT assinante_plus FROM public.usuarios WHERE auth_id = auth.uid()) = true);
CREATE POLICY "alertas_insert_assinantes" ON public.alertas_seguranca FOR INSERT TO authenticated WITH CHECK ((SELECT assinante_plus FROM public.usuarios WHERE auth_id = auth.uid()) = true);

-- PESQUISAS E RESPOSTAS
ALTER TABLE public.pesquisas ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.pesquisas TO authenticated;
CREATE POLICY "pesquisas_select" ON public.pesquisas FOR SELECT TO authenticated USING (true);

ALTER TABLE public.respostas_pesquisa ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.respostas_pesquisa TO authenticated;
CREATE POLICY "respostas_select" ON public.respostas_pesquisa FOR SELECT TO authenticated USING (true);
CREATE POLICY "respostas_insert_once" ON public.respostas_pesquisa FOR INSERT TO authenticated WITH CHECK (true);

-- DEMAIS TABELAS
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.eventos TO authenticated;
CREATE POLICY "eventos_select" ON public.eventos FOR SELECT TO authenticated USING (aprovado = true OR usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "eventos_insert" ON public.eventos FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.mural_avisos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.mural_avisos TO authenticated;
CREATE POLICY "mural_select" ON public.mural_avisos FOR SELECT TO authenticated USING (ativo = true);
CREATE POLICY "mural_insert" ON public.mural_avisos FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.banners TO authenticated;
CREATE POLICY "banners_select" ON public.banners FOR SELECT TO authenticated USING (ativo = true);

ALTER TABLE public.telefones_uteis ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.telefones_uteis TO authenticated;
CREATE POLICY "telefones_select" ON public.telefones_uteis FOR SELECT TO authenticated USING (true);

ALTER TABLE public.contatos_confianca ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.contatos_confianca TO authenticated;
CREATE POLICY "contatos_own" ON public.contatos_confianca FOR ALL TO authenticated USING (usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid()));
