import { useQuery } from '@tanstack/react-query';
import { fetchQuestionWithDetails } from '../../services/question.service';
import { ItemQuestion } from '../../types/question.types';

export const useQuestionWithDetailsQuery = (questionId: string) => {
  return useQuery<ItemQuestion>({
    queryKey: ['questionWithDetails', questionId],
    queryFn: () => fetchQuestionWithDetails(questionId),
    enabled: !!questionId,
  });
}; 