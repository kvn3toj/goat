import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteQuestionCycle } from '../../services/question.service';
import { toast } from 'sonner';

export const useDeleteQuestionCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; questionId: string }>({
    mutationFn: ({ id }) => deleteQuestionCycle(id),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ['questionCycles', questionId] });
      toast.success('Ciclo eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar el ciclo: ' + error.message);
    },
  });
}; 