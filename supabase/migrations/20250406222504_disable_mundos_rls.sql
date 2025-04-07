-- Migration to temporarily disable RLS on mundos for debugging purposes
COMMENT ON TABLE public.mundos IS 'Temporarily disabling RLS for debugging loading issue. REMEMBER TO RE-ENABLE!';

ALTER TABLE public.mundos DISABLE ROW LEVEL SECURITY; 