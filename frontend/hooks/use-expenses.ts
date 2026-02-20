import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, QueryExpenseParams, CreateExpenseData } from '@/lib/api/expenses';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params: QueryExpenseParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: (startDate?: string, endDate?: string) =>
    [...expenseKeys.all, 'stats', { startDate, endDate }] as const,
  trend: (days?: number) => [...expenseKeys.all, 'trend', days] as const,
};

export function useExpenses(params: QueryExpenseParams = {}) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expensesApi.findAll(params),
  });
}

export function useExpenseStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: expenseKeys.stats(startDate, endDate),
    queryFn: () => expensesApi.getStats(startDate, endDate),
  });
}

export function useExpenseTrend(days?: number) {
  return useQuery({
    queryKey: expenseKeys.trend(days),
    queryFn: () => expensesApi.getTrend(days),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => expensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseData> }) =>
      expensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}
