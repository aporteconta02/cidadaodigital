
-- 1) Tabela cupons
CREATE TABLE IF NOT EXISTS public.cupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  descricao TEXT,
  tipo_desconto TEXT NOT NULL CHECK (tipo_desconto IN ('percentual','valor_fixo')),
  valor_desconto NUMERIC(10,2) NOT NULL CHECK (valor_desconto >= 0),
  valor_minimo_pedido NUMERIC(10,2) NOT NULL DEFAULT 0,
  limite_uso INTEGER,
  total_usado INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  validade TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(loja_id, codigo)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cupons TO authenticated;
GRANT ALL ON public.cupons TO service_role;

ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cupons_select_ativos" ON public.cupons;
CREATE POLICY "cupons_select_ativos" ON public.cupons
  FOR SELECT TO authenticated
  USING (
    ativo = true
    OR loja_id IN (
      SELECT id FROM public.lojas
      WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "cupons_manage_owner" ON public.cupons;
CREATE POLICY "cupons_manage_owner" ON public.cupons
  FOR ALL TO authenticated
  USING (
    loja_id IN (
      SELECT id FROM public.lojas
      WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
    )
  )
  WITH CHECK (
    loja_id IN (
      SELECT id FROM public.lojas
      WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_id = auth.uid())
    )
  );

-- 2) Colunas em pedidos
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS cupom_id UUID REFERENCES public.cupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS valor_desconto NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS troco_para NUMERIC(10,2);

ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_forma_pagamento_check;
ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_forma_pagamento_check
  CHECK (forma_pagamento IS NULL OR forma_pagamento IN ('dinheiro','pix_entrega','cartao_credito','cartao_debito'));

-- 3) Trigger para incrementar total_usado
CREATE OR REPLACE FUNCTION public.increment_cupom_uso()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.cupom_id IS NOT NULL THEN
    UPDATE public.cupons SET total_usado = COALESCE(total_usado,0) + 1
    WHERE id = NEW.cupom_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_cupom_uso ON public.pedidos;
CREATE TRIGGER trg_increment_cupom_uso
AFTER INSERT ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.increment_cupom_uso();
