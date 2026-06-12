-- RLS para denuncias
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.denuncias TO authenticated;
GRANT ALL ON public.denuncias TO service_role;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ver todas denuncias') THEN
        CREATE POLICY "Ver todas denuncias" ON public.denuncias FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Criar denuncias') THEN
        CREATE POLICY "Criar denuncias" ON public.denuncias FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
    END IF;
END $$;

-- RLS para eventos
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.eventos TO authenticated;
GRANT ALL ON public.eventos TO service_role;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ver eventos aprovados') THEN
        CREATE POLICY "Ver eventos aprovados" ON public.eventos FOR SELECT TO authenticated USING (aprovado = true OR auth.uid() = usuario_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Propor eventos') THEN
        CREATE POLICY "Propor eventos" ON public.eventos FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
    END IF;
END $$;

-- RLS para pesquisas
ALTER TABLE public.pesquisas ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.pesquisas TO authenticated;
GRANT ALL ON public.pesquisas TO service_role;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ver pesquisas ativas') THEN
        CREATE POLICY "Ver pesquisas ativas" ON public.pesquisas FOR SELECT TO authenticated USING (ativa = true);
    END IF;
END $$;

-- RLS para respostas_pesquisa
ALTER TABLE public.respostas_pesquisa ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.respostas_pesquisa TO authenticated;
GRANT ALL ON public.respostas_pesquisa TO service_role;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ver suas proprias respostas') THEN
        CREATE POLICY "Ver suas proprias respostas" ON public.respostas_pesquisa FOR SELECT TO authenticated USING (auth.uid() = usuario_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Votar em pesquisas') THEN
        CREATE POLICY "Votar em pesquisas" ON public.respostas_pesquisa FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
    END IF;
END $$;

-- RLS para mural_avisos
ALTER TABLE public.mural_avisos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mural_avisos TO authenticated;
GRANT ALL ON public.mural_avisos TO service_role;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ver avisos ativos') THEN
        CREATE POLICY "Ver avisos ativos" ON public.mural_avisos FOR SELECT TO authenticated USING (ativo = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Postar no mural') THEN
        CREATE POLICY "Postar no mural" ON public.mural_avisos FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Gerenciar proprios avisos') THEN
        CREATE POLICY "Gerenciar proprios avisos" ON public.mural_avisos FOR ALL TO authenticated USING (auth.uid() = usuario_id);
    END IF;
END $$;

-- RLS para telefones_uteis
ALTER TABLE public.telefones_uteis ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.telefones_uteis TO authenticated;
GRANT ALL ON public.telefones_uteis TO service_role;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ver telefones uteis') THEN
        CREATE POLICY "Ver telefones uteis" ON public.telefones_uteis FOR SELECT TO authenticated USING (true);
    END IF;
END $$;
