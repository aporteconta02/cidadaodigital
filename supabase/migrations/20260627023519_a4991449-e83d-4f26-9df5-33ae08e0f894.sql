DROP POLICY IF EXISTS "usuarios podem ver sos" ON public.sos_alerts;

CREATE POLICY "owner reads own sos" ON public.sos_alerts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "admin reads sos" ON public.sos_alerts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));