-- Fix search_path for database function
ALTER FUNCTION public.generate_member_number() SET search_path = public;

-- Storage Policies for Private Buckets (using RLS for access)
-- Note: Even if public: false, we can allow SELECT to authenticated users or anon

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatares');

CREATE POLICY "Users can view all avatars" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'avatares');

-- Denuncias
CREATE POLICY "Users can upload denuncia photos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fotos-denuncias');

CREATE POLICY "Users can view denuncia photos" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'fotos-denuncias');

-- Banners
CREATE POLICY "Users can view all banners" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'banners');

-- Products
CREATE POLICY "Users can view all product photos" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'fotos-produtos');