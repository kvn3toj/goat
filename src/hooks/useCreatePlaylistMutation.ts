import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPlaylist, CreatePlaylistData } from '../services/playlist.service';

export const useCreatePlaylistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CreatePlaylistData; userId: string }) => createPlaylist(data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating playlist:', error);
      toast.error('Error al crear la playlist');
    },
  });
}; 