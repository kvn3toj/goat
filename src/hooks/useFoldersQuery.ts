import { useQuery } from '@tanstack/react-query';
import { fetchFolders } from '../services/folder.service';
import { PlaylistFolder } from '../types/folder.types';

export const useFoldersQuery = (mundoId: string) => {
  return useQuery<PlaylistFolder[]>({
    queryKey: ['folders', mundoId],
    queryFn: () => fetchFolders(mundoId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}; 