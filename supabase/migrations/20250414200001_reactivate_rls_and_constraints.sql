BEGIN;

-- Asignar un owner por defecto a registros sin created_by
UPDATE public.mundos SET created_by = '00000000-0000-0000-0000-000000000001' WHERE created_by IS NULL;
UPDATE public.playlists SET created_by = '00000000-0000-0000-0000-000000000001' WHERE created_by IS NULL;
UPDATE public.playlist_folders SET created_by = '00000000-0000-0000-0000-000000000001' WHERE created_by IS NULL;

-- Hacer created_by NOT NULL
ALTER TABLE public.mundos ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.playlists ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE public.playlist_folders ALTER COLUMN created_by SET NOT NULL;

-- Reactivar RLS y Definir Políticas Base

-- mundos
ALTER TABLE public.mundos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mundos FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated users (mundos)" ON public.mundos;
CREATE POLICY "Allow read access to authenticated users (mundos)" ON public.mundos
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (mundos)" ON public.mundos;
CREATE POLICY "Allow insert/update/delete by admins (mundos)" ON public.mundos
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

-- playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated users (playlists)" ON public.playlists;
CREATE POLICY "Allow read access to authenticated users (playlists)" ON public.playlists
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (playlists)" ON public.playlists;
CREATE POLICY "Allow insert/update/delete by admins (playlists)" ON public.playlists
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

-- playlist_folders
ALTER TABLE public.playlist_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_folders FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated users (folders)" ON public.playlist_folders;
CREATE POLICY "Allow read access to authenticated users (folders)" ON public.playlist_folders
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (folders)" ON public.playlist_folders;
CREATE POLICY "Allow insert/update/delete by admins (folders)" ON public.playlist_folders
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

-- playlist_items
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated users (items)" ON public.playlist_items;
CREATE POLICY "Allow read access to authenticated users (items)" ON public.playlist_items
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (items)" ON public.playlist_items;
CREATE POLICY "Allow insert/update/delete by admins (items)" ON public.playlist_items
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

-- item_questions
ALTER TABLE public.item_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_questions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated users (questions)" ON public.item_questions;
CREATE POLICY "Allow read access to authenticated users (questions)" ON public.item_questions
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (questions)" ON public.item_questions;
CREATE POLICY "Allow insert/update/delete by admins (questions)" ON public.item_questions
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

-- question_cycles
ALTER TABLE public.question_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_cycles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated users (cycles)" ON public.question_cycles;
CREATE POLICY "Allow read access to authenticated users (cycles)" ON public.question_cycles
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (cycles)" ON public.question_cycles;
CREATE POLICY "Allow insert/update/delete by admins (cycles)" ON public.question_cycles
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

-- cycle_answers
ALTER TABLE public.cycle_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_answers FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to authenticated users (answers)" ON public.cycle_answers;
CREATE POLICY "Allow read access to authenticated users (answers)" ON public.cycle_answers
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (answers)" ON public.cycle_answers;
CREATE POLICY "Allow insert/update/delete by admins (answers)" ON public.cycle_answers
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

COMMIT; 