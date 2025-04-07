import { useQuery } from '@tanstack/react-query';
import { fetchMundos } from '../services/mundo.service';
import { Mundo } from '../types/mundo.types';

export const useMundosQuery = () => {
  return useQuery<Mundo[]>({
    queryKey: ['mundos'],
    queryFn: fetchMundos,
  });
}; 