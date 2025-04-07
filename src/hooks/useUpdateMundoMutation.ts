import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMundo } from '../services/mundo.service';
import type { Mundo } from '../types/mundo.types';
import { toast } from 'sonner';

type UpdateMundoVariables = {
  id: string;
  data: Pick<Mundo, 'name' | 'description' | 'is_active'>;
};

export const useUpdateMundoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateMundoVariables) => updateMundo(id, data),
    onSuccess: (updatedMundo: Mundo) => {
      queryClient.invalidateQueries({ queryKey: ['mundos'] });
      toast.success(`Mundo "${updatedMundo.name}" actualizado exitosamente`);
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar el mundo: ${error.message}`);
    },
  });
}; 