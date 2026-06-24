-- Grants for pesquisas and respostas_pesquisa (Data API access)
GRANT SELECT ON public.pesquisas TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pesquisas TO authenticated;
GRANT ALL ON public.pesquisas TO service_role;

GRANT SELECT, INSERT ON public.respostas_pesquisa TO authenticated;
GRANT ALL ON public.respostas_pesquisa TO service_role;

-- Allow authenticated users to see all responses so vote counts/results render
DROP POLICY IF EXISTS "Usuários podem ver suas próprias respostas" ON public.respostas_pesquisa;
CREATE POLICY "Autenticados podem ver respostas"
  ON public.respostas_pesquisa
  FOR SELECT
  TO authenticated
  USING (true);
