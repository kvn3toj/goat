import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlaylistStatus } from '../services/playlist.service';
import { toast } from 'sonner';

export const useUpdatePlaylistStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      updatePlaylistStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success('Playlist status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating playlist status:', error);
      toast.error('Failed to update playlist status');
    },
  });
}; 