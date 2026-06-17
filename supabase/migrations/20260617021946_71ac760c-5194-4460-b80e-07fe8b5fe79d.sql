
-- 1) denuncias: remover política INSERT quebrada
DROP POLICY IF EXISTS "Criar denuncias" ON public.denuncias;

-- 2) mural_avisos: remover políticas que usam auth.uid()=usuario_id (mismatch)
DROP POLICY IF EXISTS "Postar no mural" ON public.mural_avisos;
DROP POLICY IF EXISTS "Gerenciar proprios avisos" ON public.mural_avisos;
-- limpar SELECTs duplicadas (mantém uma)
DROP POLICY IF EXISTS "Ver avisos ativos" ON public.mural_avisos;
DROP POLICY IF EXISTS "mural_select" ON public.mural_avisos;

-- 3) Realtime: restringir subscrições por tópico do próprio usuário
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own topics" ON realtime.messages;
CREATE POLICY "Users can subscribe to own topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- tópico deve começar com o auth.uid() do usuário OU com o usuarios.id correspondente
  (realtime.topic() LIKE auth.uid()::text || '%')
  OR (realtime.topic() IN (
       SELECT u.id::text FROM public.usuarios u WHERE u.auth_id = auth.uid()
     ))
  OR (realtime.topic() LIKE 'user:' || auth.uid()::text || '%')
);
