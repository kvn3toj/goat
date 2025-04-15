import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updatePlaylistItemOrder } from '../../services/playlistItem.service';

interface UpdatePlaylistItemOrderParams {
  itemId: string;
  direction: 'up' | 'down';
}

export const useUpdatePlaylistItemOrderMutation = (playlistId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, direction }: UpdatePlaylistItemOrderParams) => 
      updatePlaylistItemOrder(itemId, direction),
    onError: (error, variables) => {
      console.error('[useUpdateItemOrderMutation] Error:', error, 'Variables:', variables);
      toast.error(`Error al mover el video: ${(error as Error)?.message ?? 'Desconocido'}`);
    },
    onSuccess: (data, variables) => {
      console.log('[useUpdateItemOrderMutation] Éxito. Variables:', variables, 'Data:', data);
      
      if (data.message) {
        toast.info(data.message);
      } else {
        // Invalida la query de la playlist específica
        queryClient.invalidateQueries({ queryKey: ['playlistItems', playlistId] });
        toast.success('Video movido');
      }
    }
  });
}; 