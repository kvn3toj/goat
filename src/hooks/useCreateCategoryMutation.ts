import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../services/category.service';

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      // Invalidar la caché de categorías para forzar una recarga
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}; 