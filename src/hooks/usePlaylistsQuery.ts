import { useQuery } from '@tanstack/react-query';
import { fetchPlaylists } from '../services/playlist.service';
import { Playlist } from '../types/playlist.types';

export const usePlaylistsQuery = () => {
  return useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: fetchPlaylists,
  });
}; 