import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMundo } from '../services/mundo.service';
import { toast } from 'sonner';

export const useDeleteMundoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMundo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mundos'] });
      toast.success('Mundo eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar el mundo: ${error.message}`);
    },
  });
}; 