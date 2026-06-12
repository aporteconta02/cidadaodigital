-- Função para incrementar confirmações de alertas
CREATE OR REPLACE FUNCTION public.increment_confirmacoes(alert_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.alertas_seguranca
  SET confirmacoes = COALESCE(confirmacoes, 0) + 1
  WHERE id = alert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_confirmacoes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_confirmacoes(UUID) TO service_role;

-- RLS Alertas
ALTER TABLE public.alertas_seguranca ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Qualquer usuário autenticado pode ver alertas') THEN
        CREATE POLICY "Qualquer usuário autenticado pode ver alertas" 
        ON public.alertas_seguranca FOR SELECT 
        TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem criar alertas') THEN
        CREATE POLICY "Usuários podem criar alertas" 
        ON public.alertas_seguranca FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = usuario_id OR usuario_id IS NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem atualizar seus próprios alertas') THEN
        CREATE POLICY "Usuários podem atualizar seus próprios alertas" 
        ON public.alertas_seguranca FOR UPDATE 
        TO authenticated 
        USING (auth.uid() = usuario_id)
        WITH CHECK (auth.uid() = usuario_id);
    END IF;
END $$;

-- RLS Contatos
ALTER TABLE public.contatos_confianca ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem gerenciar seus próprios contatos') THEN
        CREATE POLICY "Usuários podem gerenciar seus próprios contatos" 
        ON public.contatos_confianca FOR ALL 
        TO authenticated 
        USING (auth.uid() = usuario_id)
        WITH CHECK (auth.uid() = usuario_id);
    END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertas_seguranca TO authenticated;
GRANT ALL ON public.alertas_seguranca TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contatos_confianca TO authenticated;
GRANT ALL ON public.contatos_confianca TO service_role;
