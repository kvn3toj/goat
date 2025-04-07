import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createFolder, CreateFolderData } from '../services/folder.service';

export const useCreateFolderMutation = (mundoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreateFolderData; userId: string }) => createFolder(data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', mundoId] });
      toast.success('Carpeta creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating folder:', error);
      toast.error('Error al crear la carpeta');
    },
  });
}; 