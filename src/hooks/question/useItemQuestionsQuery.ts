import { useQuery } from '@tanstack/react-query';
import { fetchItemQuestions } from '../../services/question.service';
import { ItemQuestion } from '../../types/question.types';

export const useItemQuestionsQuery = (itemId: string) => {
  return useQuery<ItemQuestion[]>({
    queryKey: ['itemQuestions', itemId],
    queryFn: () => fetchItemQuestions(itemId),
    enabled: !!itemId,
  });
}; 