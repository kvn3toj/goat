-- Migration to reinstate security constraints and RLS

-- 1. Add and enforce created_by in playlist_folders
-- Add the column first, allowing NULL initially to handle existing rows if any
ALTER TABLE public.playlist_folders
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.playlist_folders.created_by IS 'The admin user who created the folder.';

-- Attempt to populate created_by for existing rows (using a default dev admin if needed)
-- This assumes the dev admin '0000...0001' exists from seed.sql
-- Adjust the UUID if you used a different one or prefer another default user.
-- WARNING: This is a placeholder assignment for existing rows created during the workaround.
UPDATE public.playlist_folders
SET created_by = '00000000-0000-0000-0000-000000000001'
WHERE created_by IS NULL;

-- Now, make the column NOT NULL
ALTER TABLE public.playlist_folders
  ALTER COLUMN created_by SET NOT NULL;

-- 2. Enforce created_by in mundos (assuming it exists but was made nullable)
-- WARNING: Update existing NULLs first if necessary, similar to folders.
UPDATE public.mundos
SET created_by = '00000000-0000-0000-0000-000000000001' -- Use appropriate default user
WHERE created_by IS NULL;

ALTER TABLE public.mundos
  ALTER COLUMN created_by SET NOT NULL;

-- 3. Enforce created_by in playlists (assuming it was added but nullable)
-- Add the column first if it was completely removed
ALTER TABLE public.playlists
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.playlists.created_by IS 'The admin user who created the playlist.';

-- WARNING: Update existing NULLs first if necessary, similar to folders.
UPDATE public.playlists
SET created_by = '00000000-0000-0000-0000-000000000001' -- Use appropriate default user
WHERE created_by IS NULL;

 -- Now, make the column NOT NULL
ALTER TABLE public.playlists
  ALTER COLUMN created_by SET NOT NULL;

-- 4. Reactivate RLS and Apply Policies

-- mundos
ALTER TABLE public.mundos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated admins" ON public.mundos;
CREATE POLICY "Allow read access to authenticated admins" ON public.mundos
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert/update/delete by admins" ON public.mundos;
CREATE POLICY "Allow insert/update/delete by admins" ON public.mundos
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))
  ) WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))
  );

-- playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
-- Policy examples (adjust as needed):
DROP POLICY IF EXISTS "Allow read access to authenticated admins (playlists)" ON public.playlists;
CREATE POLICY "Allow read access to authenticated admins (playlists)" ON public.playlists
  FOR SELECT TO authenticated USING (true); -- Or filter by mundo access, etc.
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (playlists)" ON public.playlists;
CREATE POLICY "Allow insert/update/delete by admins (playlists)" ON public.playlists
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))
    -- Optional: Add check for mundo ownership/access if needed
    -- AND mundo_id IN (SELECT id FROM mundos WHERE created_by = auth.uid() OR ...)
  ) WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))
    -- Optional: Add check for mundo ownership/access if needed
  );

-- playlist_folders
ALTER TABLE public.playlist_folders ENABLE ROW LEVEL SECURITY;
-- Policy examples (adjust as needed):
DROP POLICY IF EXISTS "Allow read access to authenticated admins (folders)" ON public.playlist_folders;
CREATE POLICY "Allow read access to authenticated admins (folders)" ON public.playlist_folders
  FOR SELECT TO authenticated USING (true); -- Or filter by mundo access, etc.
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (folders)" ON public.playlist_folders;
CREATE POLICY "Allow insert/update/delete by admins (folders)" ON public.playlist_folders
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))
     -- Optional: Add check for mundo ownership/access if needed
  ) WITH CHECK (
    auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))
     -- Optional: Add check for mundo ownership/access if needed
  ); 