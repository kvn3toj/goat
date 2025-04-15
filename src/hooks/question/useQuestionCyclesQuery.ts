import { useQuery } from '@tanstack/react-query';
import { fetchQuestionCycles } from '../../services/question.service';
import { QuestionCycle } from '../../types/question.types';

export const useQuestionCyclesQuery = (questionId: string) => {
  return useQuery<QuestionCycle[]>({
    queryKey: ['questionCycles', questionId],
    queryFn: () => fetchQuestionCycles(questionId),
    enabled: !!questionId,
  });
}; 