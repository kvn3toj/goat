-- Verificar si ya existe la columna created_by en question_cycles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'question_cycles' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.question_cycles 
      ADD COLUMN created_by UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid REFERENCES public.admin_profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cycle_answers' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.cycle_answers 
      ADD COLUMN created_by UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid REFERENCES public.admin_profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'item_questions' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.item_questions 
      ADD COLUMN created_by UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid REFERENCES public.admin_profiles(id) ON DELETE SET NULL;
  END IF;
END $$; 