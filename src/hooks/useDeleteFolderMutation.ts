import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { softDeleteFolder } from '../services/folder.service';

export const useDeleteFolderMutation = (mundoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => softDeleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', mundoId] });
      toast.success('Carpeta eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting folder:', error);
      toast.error('Error al eliminar la carpeta');
    },
  });
}; 