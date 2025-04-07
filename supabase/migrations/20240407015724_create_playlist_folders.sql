-- Crear tabla playlist_folders
CREATE TABLE IF NOT EXISTS public.playlist_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mundo_id UUID NOT NULL REFERENCES public.mundos(id) ON DELETE CASCADE, -- Carpeta pertenece a un mundo
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false, -- Para la sección "Fijado"
  -- created_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL, -- Añadir después
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Soft delete columns
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.playlist_folders IS 'Folders to organize playlists within a Mundo.';
COMMENT ON COLUMN public.playlist_folders.mundo_id IS 'The Mundo this folder belongs to.';
COMMENT ON COLUMN public.playlist_folders.is_pinned IS 'Indicates if the folder should be shown in the pinned section.';
COMMENT ON COLUMN public.playlist_folders.is_deleted IS 'Flag for soft deletion.';
COMMENT ON COLUMN public.playlist_folders.deleted_at IS 'Timestamp when the folder was soft deleted.';

-- Crear índice para buscar carpetas activas por mundo
CREATE INDEX IF NOT EXISTS idx_playlist_folders_mundo_id_active ON public.playlist_folders (mundo_id) WHERE is_deleted = false; 