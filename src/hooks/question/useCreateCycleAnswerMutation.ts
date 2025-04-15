import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCycleAnswer } from '../../services/question.service';
import { CreateCycleAnswerDto, CycleAnswer } from '../../types/question.types';
import { toast } from 'sonner';

export const useCreateCycleAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<CycleAnswer, Error, CreateCycleAnswerDto>({
    mutationFn: createCycleAnswer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cycleAnswers', data.cycle_id] });
      toast.success('Respuesta creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear la respuesta: ' + error.message);
    },
  });
}; 