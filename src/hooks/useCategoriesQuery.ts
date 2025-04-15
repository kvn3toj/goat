import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../services/category.service';

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}; 