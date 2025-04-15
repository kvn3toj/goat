import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlaylist } from '../services/playlist.service';
import { toast } from 'sonner';

export const useDeletePlaylistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlaylist(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist eliminada', {
        action: {
          label: 'Deshacer',
          onClick: () => console.log('Deshacer eliminación playlist (pendiente):', variables),
        },
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error('Error deleting playlist:', error);
      toast.error('Error al eliminar la playlist');
    },
  });
}; 