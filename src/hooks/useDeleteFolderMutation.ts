import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { softDeleteFolder } from '../services/folder.service';

export const useDeleteFolderMutation = (mundoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => softDeleteFolder(folderId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', mundoId] });
      toast.success('Carpeta eliminada (movida a papelera)', {
        action: {
          label: 'Deshacer',
          onClick: () => console.log('Deshacer eliminación carpeta (pendiente):', variables),
        },
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Error deleting folder:', error);
      toast.error('Error al eliminar la carpeta');
    },
  });
}; 