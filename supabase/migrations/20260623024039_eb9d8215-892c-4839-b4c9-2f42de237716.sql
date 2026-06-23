
CREATE TYPE public.driver_vehicle_type AS ENUM ('carro','moto','ambos');
CREATE TYPE public.driver_approval_status AS ENUM ('pendente','aprovado','recusado');
CREATE TYPE public.ride_service_type AS ENUM ('carro','moto','entrega');
CREATE TYPE public.ride_request_status AS ENUM ('aberta','aceita','concluida','cancelada');
CREATE TYPE public.ride_offer_status AS ENUM ('pendente','aceita','recusada');
CREATE TYPE public.ride_rating_type AS ENUM ('cliente_para_driver','driver_para_cliente');

CREATE OR REPLACE FUNCTION public.current_usuario_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.usuarios WHERE auth_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- drivers
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL UNIQUE REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome_completo text NOT NULL,
  foto_url text,
  tipo_veiculo public.driver_vehicle_type NOT NULL,
  modelo_veiculo text NOT NULL,
  placa text NOT NULL,
  cnh_foto_url text NOT NULL,
  chave_pix text NOT NULL,
  status_aprovacao public.driver_approval_status NOT NULL DEFAULT 'pendente',
  motivo_recusa text,
  online boolean NOT NULL DEFAULT false,
  avaliacao_media numeric(3,2) NOT NULL DEFAULT 0,
  total_corridas integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_approved_driver(_usuario_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.drivers WHERE usuario_id = _usuario_id AND status_aprovacao = 'aprovado')
$$;

CREATE POLICY "Driver proprio" ON public.drivers FOR SELECT TO authenticated
  USING (usuario_id = public.current_usuario_id());
CREATE POLICY "Ver drivers aprovados" ON public.drivers FOR SELECT TO authenticated
  USING (status_aprovacao = 'aprovado');
CREATE POLICY "Admin ve drivers" ON public.drivers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Cria proprio driver" ON public.drivers FOR INSERT TO authenticated
  WITH CHECK (usuario_id = public.current_usuario_id());
CREATE POLICY "Atualiza proprio driver" ON public.drivers FOR UPDATE TO authenticated
  USING (usuario_id = public.current_usuario_id())
  WITH CHECK (usuario_id = public.current_usuario_id());
CREATE POLICY "Admin atualiza driver" ON public.drivers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.protect_driver_sensitive_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.status_aprovacao IS DISTINCT FROM OLD.status_aprovacao
     OR NEW.motivo_recusa IS DISTINCT FROM OLD.motivo_recusa
     OR NEW.avaliacao_media IS DISTINCT FROM OLD.avaliacao_media
     OR NEW.total_corridas IS DISTINCT FROM OLD.total_corridas
  THEN
    RAISE EXCEPTION 'Campos restritos so podem ser alterados por admin' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_drivers_protect BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.protect_driver_sensitive_fields();
CREATE TRIGGER trg_drivers_updated_at BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ride_requests
CREATE TABLE public.ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo_servico public.ride_service_type NOT NULL,
  origem text NOT NULL,
  destino text NOT NULL,
  observacao text,
  status public.ride_request_status NOT NULL DEFAULT 'aberta',
  driver_aceito_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  oferta_aceita_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ride_requests_status ON public.ride_requests(status);
CREATE INDEX idx_ride_requests_cliente ON public.ride_requests(cliente_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ride_requests TO authenticated;
GRANT ALL ON public.ride_requests TO service_role;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente ve req" ON public.ride_requests FOR SELECT TO authenticated
  USING (cliente_id = public.current_usuario_id());
CREATE POLICY "Driver ve abertas" ON public.ride_requests FOR SELECT TO authenticated
  USING (status = 'aberta' AND public.is_approved_driver(public.current_usuario_id()));
CREATE POLICY "Driver aceito ve req" ON public.ride_requests FOR SELECT TO authenticated
  USING (driver_aceito_id IN (SELECT id FROM public.drivers WHERE usuario_id = public.current_usuario_id()));
CREATE POLICY "Admin ve req" ON public.ride_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Cliente cria req" ON public.ride_requests FOR INSERT TO authenticated
  WITH CHECK (cliente_id = public.current_usuario_id());
CREATE POLICY "Cliente atualiza req" ON public.ride_requests FOR UPDATE TO authenticated
  USING (cliente_id = public.current_usuario_id())
  WITH CHECK (cliente_id = public.current_usuario_id());
CREATE POLICY "Cliente apaga req" ON public.ride_requests FOR DELETE TO authenticated
  USING (cliente_id = public.current_usuario_id() AND status IN ('aberta','cancelada'));

CREATE TRIGGER trg_ride_requests_updated_at BEFORE UPDATE ON public.ride_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ride_offers
CREATE TABLE public.ride_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  valor numeric(10,2) NOT NULL CHECK (valor > 0),
  status public.ride_offer_status NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, driver_id)
);
CREATE INDEX idx_ride_offers_request ON public.ride_offers(request_id);
CREATE INDEX idx_ride_offers_driver ON public.ride_offers(driver_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ride_offers TO authenticated;
GRANT ALL ON public.ride_offers TO service_role;
ALTER TABLE public.ride_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cliente ve ofertas" ON public.ride_offers FOR SELECT TO authenticated
  USING (request_id IN (SELECT id FROM public.ride_requests WHERE cliente_id = public.current_usuario_id()));
CREATE POLICY "Driver ve ofertas" ON public.ride_offers FOR SELECT TO authenticated
  USING (driver_id IN (SELECT id FROM public.drivers WHERE usuario_id = public.current_usuario_id()));
CREATE POLICY "Admin ve ofertas" ON public.ride_offers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Driver cria oferta" ON public.ride_offers FOR INSERT TO authenticated
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE usuario_id = public.current_usuario_id() AND status_aprovacao = 'aprovado'));
CREATE POLICY "Cliente atualiza oferta" ON public.ride_offers FOR UPDATE TO authenticated
  USING (request_id IN (SELECT id FROM public.ride_requests WHERE cliente_id = public.current_usuario_id()));
CREATE POLICY "Driver atualiza oferta" ON public.ride_offers FOR UPDATE TO authenticated
  USING (driver_id IN (SELECT id FROM public.drivers WHERE usuario_id = public.current_usuario_id()));

CREATE OR REPLACE FUNCTION public.validate_offer_request_open()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE req_status public.ride_request_status;
BEGIN
  SELECT status INTO req_status FROM public.ride_requests WHERE id = NEW.request_id;
  IF req_status <> 'aberta' THEN
    RAISE EXCEPTION 'Solicitacao nao esta aberta' USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_ride_offers_validate BEFORE INSERT ON public.ride_offers
  FOR EACH ROW EXECUTE FUNCTION public.validate_offer_request_open();
CREATE TRIGGER trg_ride_offers_updated_at BEFORE UPDATE ON public.ride_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ride_ratings
CREATE TABLE public.ride_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
  avaliador_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  avaliado_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo public.ride_rating_type NOT NULL,
  estrelas integer NOT NULL CHECK (estrelas BETWEEN 1 AND 5),
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, tipo)
);
CREATE INDEX idx_ride_ratings_avaliado ON public.ride_ratings(avaliado_id);
GRANT SELECT, INSERT ON public.ride_ratings TO authenticated;
GRANT ALL ON public.ride_ratings TO service_role;
ALTER TABLE public.ride_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth ve avaliacoes" ON public.ride_ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Avaliador insere" ON public.ride_ratings FOR INSERT TO authenticated
  WITH CHECK (
    avaliador_id = public.current_usuario_id()
    AND request_id IN (SELECT id FROM public.ride_requests WHERE status = 'concluida' AND (
      cliente_id = public.current_usuario_id()
      OR driver_aceito_id IN (SELECT id FROM public.drivers WHERE usuario_id = public.current_usuario_id())
    ))
  );

CREATE OR REPLACE FUNCTION public.update_driver_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d_id uuid;
BEGIN
  IF NEW.tipo <> 'cliente_para_driver' THEN RETURN NEW; END IF;
  SELECT id INTO d_id FROM public.drivers WHERE usuario_id = NEW.avaliado_id;
  IF d_id IS NULL THEN RETURN NEW; END IF;
  UPDATE public.drivers d SET
    avaliacao_media = COALESCE((
      SELECT AVG(r.estrelas)::numeric(3,2) FROM public.ride_ratings r
      JOIN public.ride_requests rq ON rq.id = r.request_id
      WHERE r.tipo = 'cliente_para_driver' AND rq.driver_aceito_id = d_id
    ), 0),
    total_corridas = (SELECT COUNT(*) FROM public.ride_requests WHERE driver_aceito_id = d_id AND status = 'concluida')
  WHERE d.id = d_id;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_ride_ratings_update_driver AFTER INSERT ON public.ride_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_driver_rating();

ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_offers;
ALTER TABLE public.ride_requests REPLICA IDENTITY FULL;
ALTER TABLE public.ride_offers REPLICA IDENTITY FULL;
