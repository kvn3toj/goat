-- Actualizar created_by a NOT NULL con un valor por defecto en question_cycles
ALTER TABLE public.question_cycles 
  ALTER COLUMN created_by SET NOT NULL;

-- Actualizar created_by a NOT NULL con un valor por defecto en cycle_answers
ALTER TABLE public.cycle_answers 
  ALTER COLUMN created_by SET NOT NULL;

-- Actualizar created_by a NOT NULL con un valor por defecto en item_questions
ALTER TABLE public.item_questions 
  ALTER COLUMN created_by SET NOT NULL; 