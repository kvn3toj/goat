import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createQuestionCycle,
  updateQuestionCycle,
  deleteQuestionCycle,
  CreateQuestionCycleDto,
  UpdateQuestionCycleDto,
} from '../../services/question.service';
import { useAuth } from '../../hooks/useAuth';

export const useCreateQuestionCycleMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: CreateQuestionCycleDto) => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }
      return createQuestionCycle(dto, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questionCycles', variables.item_question_id] });
      toast.success('Ciclo creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear el ciclo');
      console.error('Error creating question cycle:', error);
    },
  });
};

export const useUpdateQuestionCycleMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: UpdateQuestionCycleDto) => {
      return updateQuestionCycle(dto);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questionCycles', data.item_question_id] });
      toast.success('Ciclo actualizado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar el ciclo');
      console.error('Error updating question cycle:', error);
    },
  });
};

export const useDeleteQuestionCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuestionCycle(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questionCycles'] });
      toast.success('Ciclo eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar el ciclo');
      console.error('Error deleting question cycle:', error);
    },
  });
}; 