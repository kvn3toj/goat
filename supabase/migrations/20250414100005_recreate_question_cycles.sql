-- Recreate question_cycles table to force schema cache refresh
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

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_question_cycles_item_question_id ON public.question_cycles (item_question_id, order_index);

-- Recreate comments
COMMENT ON TABLE public.question_cycles IS 'Stores cycles (timing, variants) for a specific question.';
COMMENT ON COLUMN public.question_cycles.item_question_id IS 'The item_question this cycle belongs to.';
COMMENT ON COLUMN public.question_cycles.delay_seconds IS 'Delay in seconds before the cycle starts.';
COMMENT ON COLUMN public.question_cycles.duration_seconds IS 'Duration in seconds the cycle is active.';
COMMENT ON COLUMN public.question_cycles.order_index IS 'Order of the cycle within its question.';
COMMENT ON COLUMN public.question_cycles.is_active IS 'Whether this cycle is currently enabled.';

-- Grant privileges explicitly
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.question_cycles TO authenticated;
GRANT SELECT ON TABLE public.question_cycles TO anon;

-- Grant sequence privileges if using a sequence
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.sequences 
    WHERE sequence_schema = 'public' 
    AND sequence_name = 'question_cycles_id_seq'
  ) THEN
    EXECUTE 'GRANT USAGE ON SEQUENCE public.question_cycles_id_seq TO authenticated';
  END IF;
END $$;

-- Recreate cycle_answers table since it was dropped by CASCADE
DROP TABLE IF EXISTS public.cycle_answers CASCADE;
CREATE TABLE IF NOT EXISTS public.cycle_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_cycle_id UUID NOT NULL REFERENCES public.question_cycles(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  ondas_reward INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recreate indexes for cycle_answers
CREATE INDEX IF NOT EXISTS idx_cycle_answers_cycle_id_order ON public.cycle_answers (question_cycle_id, order_index);

-- Recreate comments for cycle_answers
COMMENT ON TABLE public.cycle_answers IS 'Stores possible answers for a specific question cycle.';
COMMENT ON COLUMN public.cycle_answers.question_cycle_id IS 'The cycle this answer belongs to.';
COMMENT ON COLUMN public.cycle_answers.ondas_reward IS 'Reward (in Ondas) for selecting this answer.';
COMMENT ON COLUMN public.cycle_answers.order_index IS 'Order of the answer within its cycle.';

-- Grant privileges for cycle_answers
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cycle_answers TO authenticated;
GRANT SELECT ON TABLE public.cycle_answers TO anon; 