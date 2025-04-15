import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCycleAnswer,
  updateCycleAnswer,
  deleteCycleAnswer,
  CreateCycleAnswerDto,
  UpdateCycleAnswerDto,
} from '../../services/question.service';

export const useCreateCycleAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCycleAnswerDto) => createCycleAnswer(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cycleAnswers', variables.question_cycle_id] });
      toast.success('Respuesta creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear la respuesta');
      console.error('Error creating cycle answer:', error);
    },
  });
};

export const useUpdateCycleAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateCycleAnswerDto) => updateCycleAnswer(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cycleAnswers', data.question_cycle_id] });
      toast.success('Respuesta actualizada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar la respuesta');
      console.error('Error updating cycle answer:', error);
    },
  });
};

export const useDeleteCycleAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCycleAnswer(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cycleAnswers'] });
      toast.success('Respuesta eliminada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar la respuesta');
      console.error('Error deleting cycle answer:', error);
    },
  });
}; 