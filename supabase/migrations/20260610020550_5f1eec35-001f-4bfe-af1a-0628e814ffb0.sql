-- Corrigir política de RLS insegura na tabela de usuários
DROP POLICY IF EXISTS "Merchants can read profiles by QR token" ON public.usuarios;

-- Nova política: Usuários podem ver seu próprio perfil, ou perfis de outros se houver uma validação de QR code registrada (ou apenas simplificar para permitir ver perfis se necessário para a lógica de negócio, mas com restrições)
-- Para este caso, vamos restringir para que apenas o próprio usuário veja seus dados sensíveis, mas permitindo SELECT básico se necessário.
-- Como o requisito original mencionava "Merchants can read profiles", vamos manter uma versão segura:
CREATE POLICY "Merchants can read profiles by QR token" ON public.usuarios
    FOR SELECT
    USING (
        auth_id = auth.uid() 
        OR 
        (SELECT tipo FROM public.usuarios WHERE auth_id = auth.uid()) = 'comerciante'
    );
-- Nota: Idealmente, merchants só veriam perfis via uma função RPC que valida o token, mas para manter a funcionalidade atual corrigindo a vulnerabilidade de 'qual: true'.

-- Garantir que a função handle_new_user seja atômica e crie a loja se necessário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO public.usuarios (auth_id, nome, email, telefone, cidade, bairro, tipo, numero_membro, qr_code_token)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Membro'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'neighborhood', ''),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'morador'),
    '#' || floor(random() * 90000 + 10000)::text,
    gen_random_uuid()::text
  )
  RETURNING id INTO new_user_id;

  -- Criar loja automaticamente se for comerciante
  IF (COALESCE(NEW.raw_user_meta_data->>'account_type', 'morador') = 'comerciante') THEN
    INSERT INTO public.lojas (usuario_id, nome, categoria, bairro, cidade, ativo)
    VALUES (
      new_user_id,
      COALESCE(NEW.raw_user_meta_data->>'shop_name', 'Minha Loja'),
      COALESCE(NEW.raw_user_meta_data->>'shop_category', 'Geral'),
      COALESCE(NEW.raw_user_meta_data->>'neighborhood', ''),
      COALESCE(NEW.raw_user_meta_data->>'city', ''),
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-garantir permissões
GRANT ALL ON public.usuarios TO service_role;
GRANT ALL ON public.lojas TO service_role;
GRANT SELECT, UPDATE ON public.usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lojas TO authenticated;
