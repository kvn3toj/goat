import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlaylistItemDetails } from '../services/playlistItem.service';
import { toast } from 'sonner';

interface UpdatePlaylistItemDetailsParams {
  id: string;
  data: {
    title?: string;
    description?: string;
  };
  playlistId: string;
}

export const useUpdatePlaylistItemDetailsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdatePlaylistItemDetailsParams) => {
      console.log('[useUpdatePlaylistItemDetailsMutation] mutationFn: Iniciando mutación con:', {
        id,
        data,
        timestamp: new Date().toISOString()
      });
      
      try {
        const result = await updatePlaylistItemDetails(id, data);
        console.log('[useUpdatePlaylistItemDetailsMutation] mutationFn: Mutación exitosa, resultado:', result);
        return result;
      } catch (error) {
        console.error('[useUpdatePlaylistItemDetailsMutation] mutationFn: Error en la mutación:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('[useUpdatePlaylistItemDetailsMutation] onSuccess: Datos actualizados:', {
        data,
        variables,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate both the list and individual item queries
      queryClient.invalidateQueries({ queryKey: ['playlistItems', variables.playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlistItem', variables.id] });
      
      toast.success('Detalles del video actualizados correctamente');
    },
    onError: (error, variables) => {
      console.error('[useUpdatePlaylistItemDetailsMutation] onError: Error en la mutación:', {
        error,
        variables,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      toast.error('Error al actualizar los detalles del video');
    },
  });
}; 