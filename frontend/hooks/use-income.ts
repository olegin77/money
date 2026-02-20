import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeApi, QueryIncomeParams, CreateIncomeData } from '@/lib/api/income';

export const incomeKeys = {
  all: ['income'] as const,
  lists: () => [...incomeKeys.all, 'list'] as const,
  list: (params: QueryIncomeParams) => [...incomeKeys.lists(), params] as const,
  stats: (startDate?: string, endDate?: string) =>
    [...incomeKeys.all, 'stats', { startDate, endDate }] as const,
  trend: (days?: number) => [...incomeKeys.all, 'trend', days] as const,
};

export function useIncome(params: QueryIncomeParams = {}) {
  return useQuery({
    queryKey: incomeKeys.list(params),
    queryFn: () => incomeApi.findAll(params),
  });
}

export function useIncomeTrend(days?: number) {
  return useQuery({
    queryKey: incomeKeys.trend(days),
    queryFn: () => incomeApi.getTrend(days),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncomeData) => incomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateIncomeData> }) =>
      incomeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
    },
  });
}
