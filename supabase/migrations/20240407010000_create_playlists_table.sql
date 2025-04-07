-- Crear tabla playlists (o experiencias)
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mundo_id UUID NOT NULL REFERENCES public.mundos(id) ON DELETE CASCADE, -- Cada playlist pertenece a un mundo
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0, -- Para ordenar playlists dentro de un mundo
  -- created_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL, -- Añadiremos esto cuando reactivemos RLS/Auth
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true
);

COMMENT ON TABLE public.playlists IS 'Stores gamified playlists or experiences within a Mundo.';
COMMENT ON COLUMN public.playlists.mundo_id IS 'The Mundo this playlist belongs to.';
COMMENT ON COLUMN public.playlists.order_index IS 'Order of the playlist within its Mundo.';

-- Nota: No se añade RLS por ahora, ya que estamos en modo diagnóstico.
-- ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
-- Añadir políticas RLS después... 