import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateQuestionCycle } from '../../services/question.service';
import { UpdateQuestionCycleDto, QuestionCycle } from '../../types/question.types';
import { toast } from 'sonner';

export const useUpdateQuestionCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<QuestionCycle, Error, UpdateQuestionCycleDto>({
    mutationFn: updateQuestionCycle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questionCycles', data.question_id] });
      toast.success('Ciclo actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar el ciclo: ' + error.message);
    },
  });
}; 