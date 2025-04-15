-- Crear tabla item_questions (Información General de la Pregunta)
CREATE TABLE IF NOT EXISTS public.item_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.playlist_items(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'a_b', 'quiz')),
  display_timestamp REAL NOT NULL DEFAULT 0.0 CHECK (display_timestamp >= 0),
  order_index INTEGER NOT NULL DEFAULT 0,
  presentation_language TEXT DEFAULT 'es',
  show_subtitles BOOLEAN DEFAULT false,
  show_question BOOLEAN DEFAULT true,
  randomize_cycles BOOLEAN DEFAULT false,
  randomize_answers BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.item_questions IS 'Stores general information and settings for an interactive question.';
CREATE INDEX IF NOT EXISTS idx_item_questions_item_id_order ON public.item_questions (item_id, order_index);

-- Crear tabla question_cycles (Ciclos dentro de una Pregunta)
DROP TABLE IF EXISTS public.question_cycles CASCADE;
CREATE TABLE public.question_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_question_id UUID NOT NULL REFERENCES public.item_questions(id) ON DELETE CASCADE,
  delay_seconds INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.question_cycles IS 'Stores cycles (timing, variants) for a specific question.';
COMMENT ON COLUMN public.question_cycles.item_question_id IS 'The item_question this cycle belongs to.';
COMMENT ON COLUMN public.question_cycles.delay_seconds IS 'Delay in seconds before the cycle starts.';
COMMENT ON COLUMN public.question_cycles.duration_seconds IS 'Duration in seconds the cycle is active.';
COMMENT ON COLUMN public.question_cycles.order_index IS 'Order of the cycle within its question.';
COMMENT ON COLUMN public.question_cycles.is_active IS 'Whether this cycle is currently enabled.';
CREATE INDEX IF NOT EXISTS idx_question_cycles_item_question_id ON public.question_cycles (item_question_id, order_index);

-- Crear tabla cycle_answers (Respuestas dentro de un Ciclo)
DROP TABLE IF EXISTS public.cycle_answers CASCADE;
CREATE TABLE public.cycle_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_cycle_id UUID NOT NULL REFERENCES public.question_cycles(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  ondas_reward INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE public.cycle_answers IS 'Stores possible answers for a specific question cycle.';
COMMENT ON COLUMN public.cycle_answers.question_cycle_id IS 'The cycle this answer belongs to.';
COMMENT ON COLUMN public.cycle_answers.ondas_reward IS 'Reward (in Ondas) for selecting this answer.';
COMMENT ON COLUMN public.cycle_answers.order_index IS 'Order of the answer within its cycle.';
CREATE INDEX IF NOT EXISTS idx_cycle_answers_cycle_id_order ON public.cycle_answers (question_cycle_id, order_index);

-- Nota: No se añade RLS por ahora. 