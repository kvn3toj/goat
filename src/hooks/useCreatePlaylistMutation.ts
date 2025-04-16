import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPlaylist, CreatePlaylistData } from '../services/playlist.service';

export const useCreatePlaylistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreatePlaylistData; userId: string }) => createPlaylist(data, userId),
    onSuccess: () => {
      console.log('[useCreatePlaylistMutation] Playlist creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist creada exitosamente');
    },
    onError: (error) => {
      console.error('[useCreatePlaylistMutation] Error:', {
        error,
        message: error.message,
        name: error.name,
        stack: error.stack,
        // Si es un error de Supabase, incluir detalles adicionales
        details: error.details,
        hint: error.hint,
        code: error.code
      }); // Log 3
      toast.error('Error al crear la playlist: ' + error.message);
    },
  });
}; 