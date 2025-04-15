import { useQuery } from '@tanstack/react-query';
import { fetchItemCategoryIds } from '../services/category.service';

export const useItemCategoriesQuery = (itemId?: string) => {
  return useQuery({
    queryKey: ['itemCategories', itemId],
    queryFn: () => (itemId ? fetchItemCategoryIds(itemId) : Promise.resolve([])),
    enabled: !!itemId,
  });
}; 