import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItemQuestion } from '../../services/question.service';
import { CreateItemQuestionDto, ItemQuestion } from '../../types/question.types';
import { toast } from 'sonner';

interface CreateItemQuestionParams {
  data: CreateItemQuestionDto;
  userId: string;
}

export const useCreateItemQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<ItemQuestion, Error, CreateItemQuestionParams>({
    mutationFn: ({ data, userId }) => createItemQuestion(data, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['itemQuestions', data.item_id] });
      toast.success('Pregunta creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear la pregunta: ' + error.message);
    },
  });
}; 