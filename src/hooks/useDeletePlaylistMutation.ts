import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlaylist } from '../services/playlist.service';
import { toast } from 'sonner';

export const useDeletePlaylistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting playlist:', error);
      toast.error('Failed to delete playlist');
    },
  });
}; 