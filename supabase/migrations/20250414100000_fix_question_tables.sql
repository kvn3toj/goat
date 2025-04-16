-- Crear tabla item_questions si no existe
DROP TABLE IF EXISTS public.item_questions CASCADE;
CREATE TABLE IF NOT EXISTS public.item_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.playlist_items(id) ON DELETE CASCADE,
  question_text TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'a_b', 'quiz')),
  display_timestamp REAL NOT NULL DEFAULT 0.0 CHECK (display_timestamp >= 0),
  order_index INTEGER NOT NULL DEFAULT 0,
  language VARCHAR(10) DEFAULT 'es',
  show_subtitles BOOLEAN DEFAULT false,
  show_question BOOLEAN DEFAULT true,
  randomize_cycles BOOLEAN DEFAULT false,
  randomize_answers BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drop presentation_language if exists
ALTER TABLE public.item_questions DROP COLUMN IF EXISTS presentation_language;

-- Crear tabla question_cycles si no existe
DROP TABLE IF EXISTS public.question_cycles CASCADE;
CREATE TABLE IF NOT EXISTS public.question_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_question_id UUID NOT NULL REFERENCES public.item_questions(id) ON DELETE CASCADE,
  delay_seconds INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla cycle_answers si no existe
DROP TABLE IF EXISTS public.cycle_answers CASCADE;
CREATE TABLE IF NOT EXISTS public.cycle_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_cycle_id UUID NOT NULL REFERENCES public.question_cycles(id) ON DELETE CASCADE,
  answer_text TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  ondas_reward INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Añadir comentarios a las tablas y columnas
COMMENT ON TABLE public.item_questions IS 'Stores general information and settings for an interactive question.';
COMMENT ON COLUMN public.item_questions.question_text IS 'The main text content of the question.';
COMMENT ON COLUMN public.item_questions.language IS 'Language code for the question (e.g., es, en).';
COMMENT ON COLUMN public.item_questions.show_subtitles IS 'Whether subtitles should be shown during the question.';
COMMENT ON COLUMN public.item_questions.show_question IS 'Whether the question text itself should be shown.';
COMMENT ON COLUMN public.item_questions.created_by IS 'The admin user who created the question.';

COMMENT ON TABLE public.question_cycles IS 'Stores cycles (timing, variants) for a specific question.';
COMMENT ON COLUMN public.question_cycles.item_question_id IS 'The item_question this cycle belongs to.';
COMMENT ON COLUMN public.question_cycles.delay_seconds IS 'Delay in seconds before the cycle starts.';
COMMENT ON COLUMN public.question_cycles.duration_seconds IS 'Duration in seconds the cycle is active.';
COMMENT ON COLUMN public.question_cycles.order_index IS 'Order of the cycle within its question.';
COMMENT ON COLUMN public.question_cycles.is_active IS 'Whether this cycle is currently enabled.';
COMMENT ON COLUMN public.question_cycles.created_by IS 'The admin user who created the cycle.';

COMMENT ON TABLE public.cycle_answers IS 'Stores possible answers for a specific question cycle.';
COMMENT ON COLUMN public.cycle_answers.question_cycle_id IS 'The cycle this answer belongs to.';
COMMENT ON COLUMN public.cycle_answers.ondas_reward IS 'Reward (in Ondas) for selecting this answer.';
COMMENT ON COLUMN public.cycle_answers.order_index IS 'Order of the answer within its cycle.';
COMMENT ON COLUMN public.cycle_answers.created_by IS 'The admin user who created the answer.';

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_item_questions_item_id_order ON public.item_questions (item_id, order_index);
CREATE INDEX IF NOT EXISTS idx_question_cycles_item_question_id ON public.question_cycles (item_question_id, order_index);
CREATE INDEX IF NOT EXISTS idx_cycle_answers_question_cycle_id_order ON public.cycle_answers (question_cycle_id, order_index);

-- Activar RLS en las tablas
ALTER TABLE public.item_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_answers ENABLE ROW LEVEL SECURITY;

-- Actualizar las políticas RLS para incluir created_by
DROP POLICY IF EXISTS "Allow read access to authenticated users (questions)" ON public.item_questions;
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (questions)" ON public.item_questions;
CREATE POLICY "Allow authenticated users to read questions" ON public.item_questions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow creators to update/delete questions" ON public.item_questions
  FOR ALL USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Allow admins to manage all questions" ON public.item_questions
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Allow read access to authenticated users (cycles)" ON public.question_cycles;
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (cycles)" ON public.question_cycles;
CREATE POLICY "Allow authenticated users to read cycles" ON public.question_cycles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow creators to update/delete cycles" ON public.question_cycles
  FOR ALL USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Allow admins to manage all cycles" ON public.question_cycles
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Allow read access to authenticated users (answers)" ON public.cycle_answers;
DROP POLICY IF EXISTS "Allow insert/update/delete by admins (answers)" ON public.cycle_answers;
CREATE POLICY "Allow authenticated users to read answers" ON public.cycle_answers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow creators to update/delete answers" ON public.cycle_answers
  FOR ALL USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Allow admins to manage all answers" ON public.cycle_answers
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN ('admin', 'super_admin'))); 