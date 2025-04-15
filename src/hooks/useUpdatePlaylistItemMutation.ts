import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlaylistItemDetails } from '../services/playlistItem.service';
import { toast } from 'sonner';

export const useUpdatePlaylistItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; description?: string | null } }) => {
      return updatePlaylistItemDetails(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playlistItem', data.id] });
      queryClient.invalidateQueries({ queryKey: ['playlistItems', data.playlist_id] });
      toast.success('Detalles del video actualizados correctamente');
    },
    onError: (error) => {
      console.error('Error updating playlist item:', error);
      toast.error('Error al actualizar los detalles del video');
    }
  });
}; 