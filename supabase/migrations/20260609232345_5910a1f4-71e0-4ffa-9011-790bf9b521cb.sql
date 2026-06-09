-- Add missing columns to usuarios table if they don't exist
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS assinante_plus BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS numero_membro TEXT,
ADD COLUMN IF NOT EXISTS validade_assinatura TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qr_code_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bairro TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'MORADOR';

-- Create Storage buckets if they don't exist
-- Note: We use the tool for bucket creation, but here we add grants for safety
GRANT ALL ON TABLE public.usuarios TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.usuarios TO authenticated;

-- Function to generate sequential member number
CREATE OR REPLACE FUNCTION public.generate_member_number() 
RETURNS TRIGGER AS $$
DECLARE
    last_number INTEGER;
BEGIN
    IF NEW.assinante_plus = true AND NEW.numero_membro IS NULL THEN
        SELECT COALESCE(MAX(CAST(numero_membro AS INTEGER)), 0) INTO last_number FROM public.usuarios WHERE numero_membro ~ '^[0-9]+$';
        NEW.numero_membro := LPAD((last_number + 1)::TEXT, 5, '0');
        NEW.qr_code_token := 'C+' || NEW.numero_membro || '-' || md5(random()::text || clock_timestamp()::text)::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate member info when upgrading
DROP TRIGGER IF EXISTS tr_generate_member_number ON public.usuarios;
CREATE TRIGGER tr_generate_member_number
BEFORE INSERT OR UPDATE ON public.usuarios
FOR EACH ROW EXECUTE FUNCTION public.generate_member_number();