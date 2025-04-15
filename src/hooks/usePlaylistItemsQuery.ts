import { useQuery } from '@tanstack/react-query';
import { fetchPlaylistItems } from '../services/playlistItem.service';
import { PlaylistItem } from '../types/playlistItem.types';

export const usePlaylistItemsQuery = (playlistId: string | undefined) => {
  return useQuery<PlaylistItem[]>({
    queryKey: ['playlistItems', playlistId],
    queryFn: () => fetchPlaylistItems(playlistId!),
    enabled: !!playlistId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}; 