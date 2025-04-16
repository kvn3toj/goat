-- Add created_by column to question_cycles if not exists
ALTER TABLE public.question_cycles 
  ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.admin_profiles(id) ON DELETE SET NULL;

-- Add created_by column to cycle_answers if not exists
ALTER TABLE public.cycle_answers 
  ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.admin_profiles(id) ON DELETE SET NULL;

-- Add created_by column to item_questions if not exists
ALTER TABLE public.item_questions 
  ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES public.admin_profiles(id) ON DELETE SET NULL;

-- Update RLS policies to include created_by using DO block to evitar errores si ya existen
DO $$
BEGIN
  -- Para item_questions
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated users to create questions') THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to create questions" ON public.item_questions
      FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow creators to update/delete questions') THEN
    EXECUTE 'CREATE POLICY "Allow creators to update/delete questions" ON public.item_questions
      FOR ALL USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow admins to manage all questions') THEN
    EXECUTE 'CREATE POLICY "Allow admins to manage all questions" ON public.item_questions
      FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN (''admin'', ''super_admin'')))
      WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN (''admin'', ''super_admin'')))';
  END IF;
  
  -- Para question_cycles
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated users to create cycles') THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to create cycles" ON public.question_cycles
      FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow creators to update/delete cycles') THEN
    EXECUTE 'CREATE POLICY "Allow creators to update/delete cycles" ON public.question_cycles
      FOR ALL USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow admins to manage all cycles') THEN
    EXECUTE 'CREATE POLICY "Allow admins to manage all cycles" ON public.question_cycles
      FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN (''admin'', ''super_admin'')))
      WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN (''admin'', ''super_admin'')))';
  END IF;
  
  -- Para cycle_answers
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated users to create answers') THEN
    EXECUTE 'CREATE POLICY "Allow authenticated users to create answers" ON public.cycle_answers
      FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow creators to update/delete answers') THEN
    EXECUTE 'CREATE POLICY "Allow creators to update/delete answers" ON public.cycle_answers
      FOR ALL USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid())';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow admins to manage all answers') THEN
    EXECUTE 'CREATE POLICY "Allow admins to manage all answers" ON public.cycle_answers
      FOR ALL USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN (''admin'', ''super_admin'')))
      WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE role IN (''admin'', ''super_admin'')))';
  END IF;
END $$; 