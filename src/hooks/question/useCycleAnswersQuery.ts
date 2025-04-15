import { useQuery } from '@tanstack/react-query';
import { fetchCycleAnswers } from '../../services/question.service';
import { CycleAnswer } from '../../types/question.types';

export const useCycleAnswersQuery = (cycleId: string) => {
  return useQuery<CycleAnswer[]>({
    queryKey: ['cycleAnswers', cycleId],
    queryFn: () => fetchCycleAnswers(cycleId),
    enabled: !!cycleId,
  });
}; 