-- Migration to make playlist_items.title nullable

ALTER TABLE public.playlist_items
  ALTER COLUMN title DROP NOT NULL;

COMMENT ON COLUMN public.playlist_items.title IS 'Title for the playlist item (e.g., video title). Made nullable.'; 