-- Políticas para itens_pedido (baseadas nos pedidos vinculados)
CREATE POLICY "Comprador vê itens dos seus pedidos" ON public.itens_pedido
    FOR SELECT
    USING (
        pedido_id IN (
            SELECT id FROM public.pedidos 
            WHERE comprador_id IN (
                SELECT id FROM public.usuarios WHERE auth_id = auth.uid()
            )
        )
    );

CREATE POLICY "Lojista vê itens dos pedidos da sua loja" ON public.itens_pedido
    FOR SELECT
    USING (
        pedido_id IN (
            SELECT id FROM public.pedidos 
            WHERE loja_id IN (
                SELECT id FROM public.lojas 
                WHERE usuario_id IN (
                    SELECT id FROM public.usuarios WHERE auth_id = auth.uid()
                )
            )
        )
    );

GRANT SELECT ON public.itens_pedido TO authenticated;
GRANT ALL ON public.itens_pedido TO service_role;
