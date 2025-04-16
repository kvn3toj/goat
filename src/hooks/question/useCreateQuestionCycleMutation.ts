import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createQuestionCycle } from '../../services/question.service';
import { CreateQuestionCycleDto } from '../../types/question.types';
import { toast } from 'sonner';
import { useAuth } from '../auth/useAuth';

export const useCreateQuestionCycleMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateQuestionCycleDto) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return createQuestionCycle(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionCycles'] });
      toast.success('Ciclo creado exitosamente');
    },
    onError: (error) => {
      console.error('[useCreateQuestionCycleMutation] Error:', error);
      toast.error('Error al crear el ciclo');
    },
  });
}; 