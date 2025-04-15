-- Update playlist_items policies to allow authenticated users to manage items
DROP POLICY IF EXISTS "Allow admins to insert items" ON public.playlist_items;
CREATE POLICY "Allow authenticated users to insert items" ON public.playlist_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admins or creators to update/delete items" ON public.playlist_items;
CREATE POLICY "Allow creators to update/delete items" ON public.playlist_items
    FOR ALL USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid()); 