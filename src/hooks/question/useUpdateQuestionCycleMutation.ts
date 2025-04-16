import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateQuestionCycle, UpdateQuestionCycleDto } from '../../services/question.service';

export const useUpdateQuestionCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateQuestionCycleDto) => updateQuestionCycle(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questionCycles', data.item_question_id] });
      toast.success('Ciclo actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar el ciclo');
      console.error('Error updating question cycle:', error);
    },
  });
}; 