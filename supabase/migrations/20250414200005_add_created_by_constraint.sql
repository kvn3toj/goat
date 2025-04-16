-- Añadir restricción de clave foránea para question_cycles.created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'question_cycles_created_by_fkey'
  ) THEN
    ALTER TABLE public.question_cycles
      ADD CONSTRAINT question_cycles_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES public.admin_profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cycle_answers_created_by_fkey'
  ) THEN
    ALTER TABLE public.cycle_answers
      ADD CONSTRAINT cycle_answers_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES public.admin_profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'item_questions_created_by_fkey'
  ) THEN
    ALTER TABLE public.item_questions
      ADD CONSTRAINT item_questions_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES public.admin_profiles(id) ON DELETE SET NULL;
  END IF;
END $$; 