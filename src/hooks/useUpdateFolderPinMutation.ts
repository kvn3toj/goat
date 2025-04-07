import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateFolderPinStatus } from '../services/folder.service';

export const useUpdateFolderPinMutation = (mundoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ folderId, isPinned }: { folderId: string; isPinned: boolean }) =>
      updateFolderPinStatus(folderId, isPinned),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', mundoId] });
      const action = variables.isPinned ? 'fijada' : 'desfijada';
      toast.success(`Carpeta ${action} exitosamente`);
    },
    onError: (error) => {
      console.error('Error updating folder pin status:', error);
      toast.error('Error al actualizar el estado de fijación de la carpeta');
    },
  });
}; 