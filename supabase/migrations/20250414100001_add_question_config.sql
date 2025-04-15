-- Add presentation config columns to item_questions
ALTER TABLE public.item_questions
  ADD COLUMN IF NOT EXISTS question_text TEXT, -- Columna para el texto principal de la pregunta
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'es', -- Código ISO ej. 'es', 'en'
  ADD COLUMN IF NOT EXISTS show_subtitles BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_question BOOLEAN DEFAULT true; -- Asumimos que la pregunta se muestra por defecto

COMMENT ON COLUMN public.item_questions.question_text IS 'The main text content of the question.';
COMMENT ON COLUMN public.item_questions.language IS 'Language code for the question (e.g., es, en).';
COMMENT ON COLUMN public.item_questions.show_subtitles IS 'Whether subtitles should be shown during the question.';
COMMENT ON COLUMN public.item_questions.show_question IS 'Whether the question text itself should be shown.'; 