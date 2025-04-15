import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCycleAnswer } from '../../services/question.service';
import { toast } from 'sonner';

export const useDeleteCycleAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; cycleId: string }>({
    mutationFn: ({ id }) => deleteCycleAnswer(id),
    onSuccess: (_, { cycleId }) => {
      queryClient.invalidateQueries({ queryKey: ['cycleAnswers', cycleId] });
      toast.success('Respuesta eliminada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar la respuesta: ' + error.message);
    },
  });
}; 