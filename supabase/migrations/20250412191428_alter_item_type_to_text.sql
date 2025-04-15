-- Migration to change playlist_items.item_type from potential ENUM to TEXT

-- Cambiar el tipo de dato a TEXT. Usamos USING para convertir valores existentes si los hubiera.
ALTER TABLE public.playlist_items
  ALTER COLUMN item_type TYPE TEXT USING item_type::text;

-- Establecer el valor por defecto si no existe o es diferente
ALTER TABLE public.playlist_items
  ALTER COLUMN item_type SET DEFAULT 'video_embed';

-- Actualizar filas existentes que podrían no tener el default (si la columna ya existía pero sin default)
-- UPDATE public.playlist_items SET item_type = 'video_embed' WHERE item_type IS NULL;
-- Nota: Comentado por seguridad, descomentar si es necesario actualizar filas antiguas.

COMMENT ON COLUMN public.playlist_items.item_type IS 'Type of content (e.g., video_embed, quiz). Changed to TEXT.'; 