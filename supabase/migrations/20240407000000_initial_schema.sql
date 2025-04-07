-- Crear tabla admin_profiles si no existe
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT, -- Añadido para que checkUsers funcione
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'ux_designer', 'ui_designer', 'content_creator')) DEFAULT 'admin', -- Default a 'admin'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.admin_profiles IS 'Stores profile information for application administrators and staff.';

-- Temporalmente deshabilitamos RLS para desarrollo
ALTER TABLE public.admin_profiles DISABLE ROW LEVEL SECURITY;

-- Crear políticas para admin_profiles (ajustar según necesidad de seguridad real)
DROP POLICY IF EXISTS "Allow individual read access" ON public.admin_profiles;
CREATE POLICY "Allow individual read access" ON public.admin_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual update access" ON public.admin_profiles;
CREATE POLICY "Allow individual update access" ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow admin read access" ON public.admin_profiles;
CREATE POLICY "Allow admin read access" ON public.admin_profiles
  FOR SELECT TO authenticated USING (true);


-- Crear tabla mundos si no existe
CREATE TABLE IF NOT EXISTS public.mundos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Considera añadir UNIQUE si los nombres deben ser únicos
  description TEXT,
  thumbnail_url TEXT,
  created_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL, -- Referencia correcta, SET NULL si se borra el admin
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

COMMENT ON TABLE public.mundos IS 'Represents the different worlds or containers for gamified experiences.';
COMMENT ON COLUMN public.mundos.created_by IS 'The admin user who created the world.';

-- Temporalmente deshabilitamos RLS para desarrollo
ALTER TABLE public.mundos DISABLE ROW LEVEL SECURITY;

-- Crear políticas para mundos (coinciden con la lógica del código)
DROP POLICY IF EXISTS "Allow read access to authenticated admins" ON public.mundos;
CREATE POLICY "Allow read access to authenticated admins" ON public.mundos
  FOR SELECT TO authenticated USING (true); -- Permite leer a cualquier admin logueado

DROP POLICY IF EXISTS "Allow insert/update/delete by admins" ON public.mundos;
CREATE POLICY "Allow insert/update/delete by admins" ON public.mundos
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))
  ) WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))
  ); 