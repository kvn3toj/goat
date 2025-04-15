-- Migration to reactivate Row Level Security on core tables

ALTER TABLE public.mundos ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.mundos IS 'RLS reactivated for Mundos.';

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.playlists IS 'RLS reactivated for Playlists.';

ALTER TABLE public.playlist_folders ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.playlist_folders IS 'RLS reactivated for Playlist Folders.';

-- Nota: Las políticas ya deberían existir por la migración anterior.
-- Este comando solo vuelve a activar la *evaluación* de esas políticas. 