import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updatePlaylistItemDetails, UpdateItemDetailsData } from '../services/playlistItem.service';

export const useUpdateItemDetailsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemDetailsData }) =>
      updatePlaylistItemDetails(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlistItems', data.playlist_id] });
      queryClient.invalidateQueries({ queryKey: ['playlistItem', variables.id] });
      toast.success('Detalles del video actualizados correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar los detalles del video');
      console.error('Error updating item details:', error);
    }
  });
}; 