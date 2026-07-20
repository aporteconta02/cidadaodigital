
-- Cliente pode ver dados do motorista que ofertou/aceitou sua corrida
CREATE POLICY "Cliente ve driver da oferta"
ON public.drivers FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT driver_id FROM public.ride_offers
    WHERE request_id IN (SELECT id FROM public.ride_requests WHERE cliente_id = public.current_usuario_id())
  )
);

-- Contraparte de uma corrida pode ver nome/telefone do outro lado (via usuarios)
CREATE POLICY "Contraparte de corrida ve usuario"
ON public.usuarios FOR SELECT
TO authenticated
USING (
  -- eu sou cliente e este usuario é motorista aceito na minha corrida
  id IN (
    SELECT d.usuario_id FROM public.drivers d
    JOIN public.ride_requests r ON r.driver_aceito_id = d.id
    WHERE r.cliente_id = public.current_usuario_id()
  )
  OR
  -- eu sou motorista aceito e este usuario é o cliente
  id IN (
    SELECT r.cliente_id FROM public.ride_requests r
    JOIN public.drivers d ON d.id = r.driver_aceito_id
    WHERE d.usuario_id = public.current_usuario_id()
  )
  OR
  -- eu sou motorista aprovado e este usuario é o cliente de uma corrida aberta
  (
    public.is_approved_driver(public.current_usuario_id())
    AND id IN (SELECT cliente_id FROM public.ride_requests WHERE status = 'aberta')
  )
);
