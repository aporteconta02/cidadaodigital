ALTER TABLE public.alertas_seguranca REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas_seguranca;