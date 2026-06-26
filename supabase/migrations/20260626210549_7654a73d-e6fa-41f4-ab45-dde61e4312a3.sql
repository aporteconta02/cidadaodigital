CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tipo TEXT NOT NULL,
  descricao TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT SELECT, INSERT ON public.sos_alerts TO authenticated;
GRANT ALL ON public.sos_alerts TO service_role;

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios podem criar sos" ON public.sos_alerts;
DROP POLICY IF EXISTS "usuarios podem ver sos" ON public.sos_alerts;

CREATE POLICY "usuarios podem criar sos" ON public.sos_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "usuarios podem ver sos" ON public.sos_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);