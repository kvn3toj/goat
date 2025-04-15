import { useQuery } from '@tanstack/react-query';
import { fetchPlaylistById } from '../services/playlist.service';

export const usePlaylistQuery = (playlistId?: string) => {
  return useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => playlistId ? fetchPlaylistById(playlistId) : Promise.resolve(null),
    enabled: !!playlistId,
  });
}; 