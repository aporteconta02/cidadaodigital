-- Allow users to view and update their own profiles
CREATE POLICY "Users can manage their own profile" ON public.usuarios
FOR ALL TO authenticated USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());

-- Allow merchants to read any profile by qr_code_token (for validation)
CREATE POLICY "Merchants can read profiles by QR token" ON public.usuarios
FOR SELECT TO authenticated USING (true); -- We allow SELECT on all profiles so they can be searched by QR token