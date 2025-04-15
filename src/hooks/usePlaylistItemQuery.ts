import { useQuery } from '@tanstack/react-query';
import { fetchPlaylistItemById } from '../services/playlistItem.service';

export const usePlaylistItemQuery = (itemId?: string) => {
  return useQuery({
    queryKey: ['playlistItem', itemId],
    queryFn: () => itemId ? fetchPlaylistItemById(itemId) : Promise.resolve(null),
    enabled: !!itemId,
  });
}; 