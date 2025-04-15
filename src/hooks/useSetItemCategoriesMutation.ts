import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setItemCategories } from '../services/category.service';

interface SetItemCategoriesParams {
  itemId: string;
  categoryIds: string[];
}

export const useSetItemCategoriesMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, categoryIds }: SetItemCategoriesParams) => 
      setItemCategories(itemId, categoryIds),
    onSuccess: (_, { itemId }) => {
      // Invalidar la consulta de categorías para este item específico
      queryClient.invalidateQueries({ queryKey: ['itemCategories', itemId] });
    },
  });
}; 