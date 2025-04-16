import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCycleAnswer } from '../../services/question.service';
import { CreateCycleAnswerDto, CycleAnswer } from '../../types/question.types';
import { toast } from 'sonner';

interface CreateCycleAnswerParams {
  data: CreateCycleAnswerDto;
  userId: string;
}

export const useCreateCycleAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CycleAnswer, Error, CreateCycleAnswerParams>({
    mutationFn: ({ data, userId }) => createCycleAnswer(data, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cycleAnswers', data.question_cycle_id] });
      toast.success('Respuesta creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear la respuesta: ' + error.message);
    },
  });
}; 