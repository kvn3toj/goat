-- Recreate cycle_answers table to force schema cache refresh and ensure correctness

DROP TABLE IF EXISTS public.cycle_answers CASCADE; -- Asegura limpieza

CREATE TABLE public.cycle_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_cycle_id UUID NOT NULL REFERENCES public.question_cycles(id) ON DELETE CASCADE, -- Nombre Correcto FK
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  ondas_reward INTEGER NOT NULL DEFAULT 0, -- Nombre Correcto
  order_index INTEGER NOT NULL DEFAULT 0, -- Nombre Correcto
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.cycle_answers IS 'Stores possible answers for a specific question cycle.';
COMMENT ON COLUMN public.cycle_answers.question_cycle_id IS 'The cycle this answer belongs to.';
COMMENT ON COLUMN public.cycle_answers.ondas_reward IS 'Reward (in Ondas) for selecting this answer.';
COMMENT ON COLUMN public.cycle_answers.order_index IS 'Order of the answer within its cycle.';

-- Recrear índice con nombre correcto
CREATE INDEX IF NOT EXISTS idx_cycle_answers_cycle_id_order ON public.cycle_answers (question_cycle_id, order_index);

-- Grant privileges explicitly
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cycle_answers TO authenticated;
GRANT SELECT ON TABLE public.cycle_answers TO anon;

-- Grant sequence privileges if using a sequence
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    AND sequence_name = 'cycle_answers_id_seq' -- Nombre de secuencia común
  ) THEN
    EXECUTE 'GRANT USAGE ON SEQUENCE public.cycle_answers_id_seq TO authenticated';
  END IF;
END $$; 