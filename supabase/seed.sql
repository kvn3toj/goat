-- supabase/seed.sql
-- Este script se ejecuta automáticamente después de las migraciones en `supabase db reset`.
-- Inserta datos de desarrollo esenciales.

-- 1. Insertar usuario de desarrollo en auth.users (si no existe)
-- Usaremos un UUID conocido para el admin de desarrollo.
-- IMPORTANTE: ¡No uses contraseñas débiles en producción! Esto es solo para desarrollo local.
INSERT INTO auth.users (id, email, encrypted_password, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'devadmin@example.com', crypt('password123', gen_salt('bf')), 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar perfil de admin para el usuario de desarrollo (si no existe)
INSERT INTO public.admin_profiles (id, full_name, email, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dev Admin', 'devadmin@example.com', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar el Mundo específico deseado por el usuario (si no existe)
-- Referencia al 'created_by' del admin de desarrollo insertado arriba.
INSERT INTO public.mundos (id, name, description, is_active, created_by)
VALUES
  ('74cccd93-2053-4ece-8dee-6bc18852e71a', 'Mundo Desarrollo Default', 'Mundo persistente para desarrollo', true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Puedes añadir aquí INSERTs para otros datos de seed si lo necesitas (playlists, carpetas, etc.)
