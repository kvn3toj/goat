-- supabase/seed.sql
-- Este script se ejecuta automáticamente después de las migraciones en `supabase db reset`.
-- Inserta datos de desarrollo esenciales.

-- 1. Crear usuario admin si no existe
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'devadmin@example.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Crear perfil de admin si no existe
INSERT INTO public.admin_profiles (id, name, role, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Dev Admin', 'admin', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Crear Mundo por defecto si no existe
INSERT INTO public.mundos (id, name, description, is_active, is_pinned, order_index, created_by, created_at, updated_at, is_deleted, deleted_at)
VALUES
    ('74cccd93-2053-4ece-8dee-6bc18852e71a', 'Mundo Desarrollo Default', 'Mundo persistente para desarrollo', true, false, 0, '00000000-0000-0000-0000-000000000001', now(), now(), false, NULL)
ON CONFLICT (id) DO NOTHING;

-- Puedes añadir aquí INSERTs para otros datos de seed si lo necesitas (playlists, carpetas, etc.)
