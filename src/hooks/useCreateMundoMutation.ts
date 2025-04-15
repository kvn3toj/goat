import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMundo } from '../services/mundo.service';
import type { Mundo, CreateMundoData } from '../types/mundo.types';
import { toast } from 'sonner';

type CreateMundoParams = {
  data: CreateMundoData;
  userId: string;
};

export const useCreateMundoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: CreateMundoParams) => createMundo(data, userId),
    onSuccess: (newMundo: Mundo) => {
      queryClient.invalidateQueries({ queryKey: ['mundos'] });
      toast.success('Mundo creado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error hook creando mundo:', error);
      toast.error(`Error al crear el mundo: ${error.message}`);
    },
  });
}; 