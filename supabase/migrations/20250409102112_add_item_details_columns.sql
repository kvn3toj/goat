-- Migration to add title and description to playlist items

ALTER TABLE public.playlist_items
  ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Video sin título'; -- Añadir con default para filas existentes

ALTER TABLE public.playlist_items
  ADD COLUMN IF NOT EXISTS description TEXT; -- Nullable

COMMENT ON COLUMN public.playlist_items.title IS 'User-defined title for the playlist item.';
COMMENT ON COLUMN public.playlist_items.description IS 'User-defined description for the playlist item.';

-- Cambiar el default después de que las filas existentes lo tengan
ALTER TABLE public.playlist_items
  ALTER COLUMN title DROP DEFAULT; 