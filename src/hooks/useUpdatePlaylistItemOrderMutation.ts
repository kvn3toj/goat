import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlaylistItemOrder } from '../services/playlistItem.service';
import { toast } from 'sonner';

interface UpdatePlaylistItemOrderParams {
  itemId: string;
  direction: 'up' | 'down';
}

export const useUpdatePlaylistItemOrderMutation = (playlistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, direction }: UpdatePlaylistItemOrderParams) => 
      updatePlaylistItemOrder(itemId, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlistItems', playlistId] });
      toast.success('Orden actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating playlist item order:', error);
      toast.error('Error al actualizar el orden');
    },
  });
}; 