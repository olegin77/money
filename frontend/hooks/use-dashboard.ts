import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: (period?: string) => [...analyticsKeys.all, 'dashboard', period] as const,
  expensesByCategory: (params?: object) =>
    [...analyticsKeys.all, 'expensesByCategory', params] as const,
  expensesTrend: (params?: object) => [...analyticsKeys.all, 'expensesTrend', params] as const,
  incomeTrend: (params?: object) => [...analyticsKeys.all, 'incomeTrend', params] as const,
  cashFlow: (params?: object) => [...analyticsKeys.all, 'cashFlow', params] as const,
  monthlyComparison: (months?: number) =>
    [...analyticsKeys.all, 'monthlyComparison', months] as const,
};

export function useDashboard(period: 'week' | 'month' | 'year' | 'all' = 'month') {
  return useQuery({
    queryKey: analyticsKeys.dashboard(period),
    queryFn: () => analyticsApi.getDashboard({ period }),
  });
}

export function useExpensesByCategory(params?: {
  startDate?: string;
  endDate?: string;
  period?: 'week' | 'month' | 'year' | 'all';
}) {
  return useQuery({
    queryKey: analyticsKeys.expensesByCategory(params),
    queryFn: () => analyticsApi.getExpensesByCategory(params),
  });
}

export function useExpensesTrend(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: analyticsKeys.expensesTrend(params),
    queryFn: () => analyticsApi.getExpensesTrend(params),
  });
}

export function useIncomeTrendAnalytics(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: analyticsKeys.incomeTrend(params),
    queryFn: () => analyticsApi.getIncomeTrend(params),
  });
}

export function useCashFlow(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: analyticsKeys.cashFlow(params),
    queryFn: () => analyticsApi.getCashFlow(params),
  });
}

export function useMonthlyComparison(months?: number) {
  return useQuery({
    queryKey: analyticsKeys.monthlyComparison(months),
    queryFn: () => analyticsApi.getMonthlyComparison(months),
  });
}
