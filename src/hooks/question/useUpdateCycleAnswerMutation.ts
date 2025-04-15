import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCycleAnswer } from '../../services/question.service';
import { UpdateCycleAnswerDto, CycleAnswer } from '../../types/question.types';
import { toast } from 'sonner';

export const useUpdateCycleAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CycleAnswer, Error, UpdateCycleAnswerDto>({
    mutationFn: updateCycleAnswer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cycleAnswers', data.cycle_id] });
      toast.success('Respuesta actualizada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar la respuesta: ' + error.message);
    },
  });
}; 