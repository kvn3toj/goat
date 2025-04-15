import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateItemQuestion } from '../../services/question.service';
import { UpdateItemQuestionDto, ItemQuestion } from '../../types/question.types';
import { toast } from 'sonner';

export const useUpdateItemQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ItemQuestion, Error, UpdateItemQuestionDto>({
    mutationFn: updateItemQuestion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['itemQuestions', data.item_id] });
      toast.success('Pregunta actualizada exitosamente');
    },
    onError: (error) => {
      console.error('[useUpdateItemQuestionMutation] Error actualizando pregunta:', error);
      toast.error('Error al actualizar la pregunta: ' + error.message);
    },
  });
}; 