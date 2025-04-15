import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteItemQuestion } from '../../services/question.service';
import { toast } from 'sonner';

export const useDeleteItemQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; itemId: string }>({
    mutationFn: ({ id }) => deleteItemQuestion(id),
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['itemQuestions', itemId] });
      toast.success('Pregunta eliminada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar la pregunta: ' + error.message);
    },
  });
}; 