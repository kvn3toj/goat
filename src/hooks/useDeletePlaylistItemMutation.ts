import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlaylistItem } from '../services/playlistItem.service';
import { toast } from 'sonner';

export const useDeletePlaylistItemMutation = (playlistId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => deletePlaylistItem(itemId),
    onSuccess: () => {
      // Invalida la query de items para esta playlist específica
      queryClient.invalidateQueries({ queryKey: ['playlistItems', playlistId] });
      toast.success('Video eliminado de la playlist');
    },
    onError: (error) => {
      console.error('Error deleting playlist item:', error);
      toast.error('Error al eliminar el video');
    },
  });
}; 