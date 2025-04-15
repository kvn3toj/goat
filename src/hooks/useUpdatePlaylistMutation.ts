import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlaylist, UpdatePlaylistData } from '../services/playlist.service';
import { toast } from 'sonner';

type UpdatePlaylistVariables = {
  id: string;
  data: UpdatePlaylistData;
};

export const useUpdatePlaylistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdatePlaylistVariables) => updatePlaylist(id, data),
    onSuccess: (updatedPlaylist) => {
      // Invalida tanto la lista de playlists como la query individual
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', updatedPlaylist.id] });
      toast.success(`Playlist "${updatedPlaylist.name}" actualizada exitosamente`);
    },
    onError: (error: Error) => {
      console.error('Error updating playlist:', error);
      toast.error(`Error al actualizar la playlist: ${error.message}`);
    },
  });
}; 