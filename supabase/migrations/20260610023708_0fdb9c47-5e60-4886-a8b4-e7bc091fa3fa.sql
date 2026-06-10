CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
    INSERT INTO public.lojas (usuario_id, nome, categoria, ativo)
    VALUES (
      new_user_id,
      COALESCE(NEW.raw_user_meta_data->>'shop_name', 'Minha Loja'),
      COALESCE(NEW.raw_user_meta_data->>'shop_category', 'Geral'),
      true
    );
  END IF;

  RETURN NEW;
END;
$$;