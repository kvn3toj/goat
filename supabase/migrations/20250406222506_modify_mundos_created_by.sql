-- Migration to make created_by nullable for development purposes
ALTER TABLE public.mundos ALTER COLUMN created_by DROP NOT NULL; 