-- Supabase Migration: Initial Database Setup for Gamifier_Admin
-- Creates core tables, types, functions, triggers, indexes, and initial RLS policies.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define custom types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'playlist_item_type') THEN
        CREATE TYPE public.playlist_item_type AS ENUM ('video', 'article', 'quiz', 'resource');
        COMMENT ON TYPE public.playlist_item_type IS 'Tipos de items posibles en playlists/folders.';
    END IF;
END$$;

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
COMMENT ON TABLE public.admin_profiles IS 'Perfiles de los usuarios administradores de la herramienta Gamifier_Admin.';
COMMENT ON COLUMN public.admin_profiles.id IS 'Referencia al ID del usuario en Supabase Auth.';
COMMENT ON COLUMN public.admin_profiles.role IS 'Rol del usuario (admin, super_admin). Determina permisos.';

-- Create mundos table
CREATE TABLE IF NOT EXISTS public.mundos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT mundos_name_unique UNIQUE (name)
);
COMMENT ON TABLE public.mundos IS 'Contenedor principal para las experiencias gamificadas (Mundos).';
COMMENT ON COLUMN public.mundos.is_active IS 'Indica si el mundo está visible/activo en Coomünity.';
COMMENT ON COLUMN public.mundos.is_pinned IS 'Permite destacar o fijar mundos importantes.';
COMMENT ON COLUMN public.mundos.order_index IS 'Índice para ordenación manual de los mundos.';
COMMENT ON COLUMN public.mundos.created_by IS 'Admin que creó originalmente este mundo.';
COMMENT ON COLUMN public.mundos.is_deleted IS 'Flag para borrado lógico (soft delete).';
COMMENT ON COLUMN public.mundos.deleted_at IS 'Fecha y hora del borrado lógico.';

-- Create playlist_folders table
CREATE TABLE IF NOT EXISTS public.playlist_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mundo_id UUID NOT NULL REFERENCES public.mundos(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT playlist_folders_name_in_mundo_unique UNIQUE (mundo_id, name)
);
COMMENT ON TABLE public.playlist_folders IS 'Carpetas contenedoras de Items dentro de un Mundo.';
COMMENT ON COLUMN public.playlist_folders.mundo_id IS 'Mundo al que pertenece esta carpeta.';
COMMENT ON COLUMN public.playlist_folders.order_index IS 'Índice para ordenación manual dentro del mundo.';

-- Create playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mundo_id UUID NOT NULL REFERENCES public.mundos(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT playlists_name_in_mundo_unique UNIQUE (mundo_id, name)
);
COMMENT ON TABLE public.playlists IS 'Playlists (secuencias de Items) dentro de un Mundo.';
COMMENT ON COLUMN public.playlists.mundo_id IS 'Mundo al que pertenece esta playlist.';
COMMENT ON COLUMN public.playlists.order_index IS 'Índice para ordenación manual dentro del mundo.';

-- Create playlist_items table
CREATE TABLE IF NOT EXISTS public.playlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.playlist_folders(id) ON DELETE CASCADE,
    item_type public.playlist_item_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_item_parent CHECK (
        (playlist_id IS NOT NULL AND folder_id IS NULL) OR
        (playlist_id IS NULL AND folder_id IS NOT NULL)
    )
);
COMMENT ON TABLE public.playlist_items IS 'Unidad de contenido individual (video, artículo, etc.) dentro de una Playlist o Carpeta.';
COMMENT ON COLUMN public.playlist_items.playlist_id IS 'Playlist a la que pertenece este item (si aplica).';
COMMENT ON COLUMN public.playlist_items.folder_id IS 'Carpeta a la que pertenece este item (si aplica).';
COMMENT ON COLUMN public.playlist_items.item_type IS 'Define el tipo de contenido del item.';
COMMENT ON COLUMN public.playlist_items.title IS 'Título principal del contenido (ej. título del video).';
COMMENT ON COLUMN public.playlist_items.description IS 'Descripción breve del contenido.';
COMMENT ON COLUMN public.playlist_items.content IS 'Datos específicos del item en formato JSON (URLs, IDs externos, configuración de quiz, etc.).';
COMMENT ON COLUMN public.playlist_items.order_index IS 'Índice para ordenación manual dentro de su contenedor (Playlist o Carpeta).';
COMMENT ON CONSTRAINT chk_item_parent ON public.playlist_items IS 'Garantiza que cada item tenga exactamente un contenedor padre (Playlist o Folder).';

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT categories_name_unique UNIQUE (name)
);
COMMENT ON TABLE public.categories IS 'Categorías globales para etiquetar y organizar playlist_items.';
COMMENT ON COLUMN public.categories.name IS 'Nombre único de la categoría.';

-- Create playlist_item_categories join table
CREATE TABLE IF NOT EXISTS public.playlist_item_categories (
    item_id UUID NOT NULL REFERENCES public.playlist_items(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE RESTRICT,
    PRIMARY KEY (item_id, category_id)
);
COMMENT ON TABLE public.playlist_item_categories IS 'Tabla de unión para la relación N:M entre Items y Categorías.';
COMMENT ON COLUMN public.playlist_item_categories.item_id IS 'Referencia al Item.';
COMMENT ON COLUMN public.playlist_item_categories.category_id IS 'Referencia a la Categoría.';
COMMENT ON COLUMN public.playlist_item_categories.created_by IS 'Admin que asignó esta categoría a este item.';

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT AS $$
DECLARE
  profile_role TEXT;
BEGIN
  SELECT role INTO profile_role FROM public.admin_profiles WHERE id = user_id;
  RETURN profile_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON FUNCTION public.get_user_role(uuid) IS 'Retrieves the role from admin_profiles for a given user ID. SECURITY DEFINER is required to read admin_profiles table.';

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION public.trigger_set_timestamp() IS 'Automatically sets the updated_at column to the current UTC timestamp on update.';

-- Apply update triggers
DROP TRIGGER IF EXISTS set_timestamp_admin_profiles ON public.admin_profiles;
CREATE TRIGGER set_timestamp_admin_profiles
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_mundos ON public.mundos;
CREATE TRIGGER set_timestamp_mundos
BEFORE UPDATE ON public.mundos
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_playlist_folders ON public.playlist_folders;
CREATE TRIGGER set_timestamp_playlist_folders
BEFORE UPDATE ON public.playlist_folders
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_playlists ON public.playlists;
CREATE TRIGGER set_timestamp_playlists
BEFORE UPDATE ON public.playlists
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_playlist_items ON public.playlist_items;
CREATE TRIGGER set_timestamp_playlist_items
BEFORE UPDATE ON public.playlist_items
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_categories ON public.categories;
CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mundos_created_by ON public.mundos(created_by);
CREATE INDEX IF NOT EXISTS idx_mundos_is_active ON public.mundos(is_active);
CREATE INDEX IF NOT EXISTS idx_playlist_folders_mundo_id ON public.playlist_folders(mundo_id);
CREATE INDEX IF NOT EXISTS idx_playlists_mundo_id ON public.playlists(mundo_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON public.playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_folder_id ON public.playlist_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_item_type ON public.playlist_items(item_type);
CREATE INDEX IF NOT EXISTS idx_playlist_item_categories_item_id ON public.playlist_item_categories(item_id);
CREATE INDEX IF NOT EXISTS idx_playlist_item_categories_category_id ON public.playlist_item_categories(category_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mundos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_item_categories ENABLE ROW LEVEL SECURITY;

-- Define RLS Policies

-- Policies for admin_profiles
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.admin_profiles;
CREATE POLICY "Allow authenticated users to read profiles" ON public.admin_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.admin_profiles;
CREATE POLICY "Allow users to insert their own profile" ON public.admin_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow super_admins to update profiles" ON public.admin_profiles;
CREATE POLICY "Allow super_admins to update profiles" ON public.admin_profiles
    FOR UPDATE USING (public.get_user_role(auth.uid()) = 'super_admin')
    WITH CHECK (public.get_user_role(auth.uid()) = 'super_admin');

DROP POLICY IF EXISTS "Allow super_admins to delete profiles" ON public.admin_profiles;
CREATE POLICY "Allow super_admins to delete profiles" ON public.admin_profiles
    FOR DELETE USING (public.get_user_role(auth.uid()) = 'super_admin');

-- Policies for mundos
DROP POLICY IF EXISTS "Allow authenticated read access to mundos" ON public.mundos;
CREATE POLICY "Allow authenticated read access to mundos" ON public.mundos
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to insert mundos" ON public.mundos;
CREATE POLICY "Allow admins to insert mundos" ON public.mundos
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Allow admins or creators to update/delete mundos" ON public.mundos;
CREATE POLICY "Allow admins or creators to update/delete mundos" ON public.mundos
    FOR ALL USING (
        (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR
        (created_by = auth.uid())
    )
    WITH CHECK (
        (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR
        (created_by = auth.uid())
    );

-- Policies for playlist_folders
DROP POLICY IF EXISTS "Allow authenticated read access to folders" ON public.playlist_folders;
CREATE POLICY "Allow authenticated read access to folders" ON public.playlist_folders
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to insert folders" ON public.playlist_folders;
CREATE POLICY "Allow admins to insert folders" ON public.playlist_folders
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Allow admins or creators to update/delete folders" ON public.playlist_folders;
CREATE POLICY "Allow admins or creators to update/delete folders" ON public.playlist_folders
    FOR ALL USING ( (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR (created_by = auth.uid()) )
    WITH CHECK ( (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR (created_by = auth.uid()) );

-- Policies for playlists
DROP POLICY IF EXISTS "Allow authenticated read access to playlists" ON public.playlists;
CREATE POLICY "Allow authenticated read access to playlists" ON public.playlists
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to insert playlists" ON public.playlists;
CREATE POLICY "Allow admins to insert playlists" ON public.playlists
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Allow admins or creators to update/delete playlists" ON public.playlists;
CREATE POLICY "Allow admins or creators to update/delete playlists" ON public.playlists
    FOR ALL USING ( (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR (created_by = auth.uid()) )
    WITH CHECK ( (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR (created_by = auth.uid()) );

-- Policies for playlist_items
DROP POLICY IF EXISTS "Allow authenticated read access to items" ON public.playlist_items;
CREATE POLICY "Allow authenticated read access to items" ON public.playlist_items
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to insert items" ON public.playlist_items;
CREATE POLICY "Allow admins to insert items" ON public.playlist_items
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Allow admins or creators to update/delete items" ON public.playlist_items;
CREATE POLICY "Allow admins or creators to update/delete items" ON public.playlist_items
    FOR ALL USING ( (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR (created_by = auth.uid()) )
    WITH CHECK ( (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR (created_by = auth.uid()) );

-- Policies for categories
DROP POLICY IF EXISTS "Allow authenticated read access to categories" ON public.categories;
CREATE POLICY "Allow authenticated read access to categories" ON public.categories
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to insert categories" ON public.categories;
CREATE POLICY "Allow admins to insert categories" ON public.categories
    FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Allow admins or creators to update/delete categories" ON public.categories;
CREATE POLICY "Allow admins or creators to update/delete categories" ON public.categories
    FOR ALL USING ( (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR (created_by = auth.uid()) )
    WITH CHECK ( (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')) OR (created_by = auth.uid()) );


-- Policies for playlist_item_categories (Join table)
DROP POLICY IF EXISTS "Allow authenticated read access to item-category links" ON public.playlist_item_categories;
CREATE POLICY "Allow authenticated read access to item-category links" ON public.playlist_item_categories
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins to manage item-category links" ON public.playlist_item_categories;
CREATE POLICY "Allow admins to manage item-category links" ON public.playlist_item_categories
    FOR ALL -- INSERT, DELETE
    USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'))
    WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'super_admin')); 