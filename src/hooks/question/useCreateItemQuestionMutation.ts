import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItemQuestion } from '../../services/question.service';
import { CreateItemQuestionDto, ItemQuestion } from '../../types/question.types';
import { toast } from 'sonner';

export const useCreateItemQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ItemQuestion, Error, CreateItemQuestionDto>({
    mutationFn: createItemQuestion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['itemQuestions', data.item_id] });
      toast.success('Pregunta creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear la pregunta: ' + error.message);
    },
  });
}; 