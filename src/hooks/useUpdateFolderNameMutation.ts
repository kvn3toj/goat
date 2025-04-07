import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateFolderName } from '../services/folder.service';

export const useUpdateFolderNameMutation = (mundoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateFolderName(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', mundoId] });
      toast.success('Nombre de carpeta actualizado');
    },
    onError: (error) => {
      console.error('Error updating folder name:', error);
      toast.error('Error al actualizar el nombre de la carpeta');
    },
  });
}; 