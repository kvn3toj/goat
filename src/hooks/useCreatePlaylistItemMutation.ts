import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlaylistItem } from '../services/playlistItem.service';
import { toast } from 'sonner';

export const useCreatePlaylistItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { 
      playlist_id: string; 
      content: string; 
      item_type?: string;
      created_by: string;
    }) => createPlaylistItem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlistItems', variables.playlist_id] });
      toast.success('Video added successfully to the playlist');
    },
    onError: (error) => {
      console.error('Error creating playlist item:', error);
      toast.error('Failed to add video to the playlist');
    },
  });
}; 