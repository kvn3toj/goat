import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuestionCycle } from '../../services/question.service';
import { CreateQuestionCycleDto, QuestionCycle } from '../../types/question.types';
import { toast } from 'sonner';

export const useCreateQuestionCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<QuestionCycle, Error, CreateQuestionCycleDto>({
    mutationFn: createQuestionCycle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questionCycles', data.item_question_id] });
      toast.success('Ciclo creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear el ciclo: ' + error.message);
    },
  });
}; 