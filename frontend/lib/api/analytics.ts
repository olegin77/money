import { api } from './client';

export interface DashboardData {
  summary: {
    totalExpenses: number;
    totalIncome: number;
    balance: number;
    expenseCount: number;
    incomeCount: number;
    avgExpense: number;
    avgIncome: number;
    savingsRate: number;
  };
  expensesByCategory: Array<{
    categoryId: string;
    total: number;
    count: number;
    average: number;
    percentage: string;
  }>;
  topExpenses: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
    type: 'expense' | 'income';
  }>;
  period: {
    start: string;
    end: string;
    label: string;
  };
}

export interface TrendData {
  date: string;
  total: number;
}

export interface CashFlowData {
  date: string;
  expenses: number;
  income: number;
  balance: number;
}

export interface MonthlyComparisonData {
  month: string;
  expenses: number;
  income: number;
  balance: number;
  savingsRate: string;
}

export const analyticsApi = {
  getDashboard: async (params?: {
    startDate?: string;
    endDate?: string;
    period?: 'week' | 'month' | 'year' | 'all';
  }): Promise<DashboardData> => {
    const response = await api.get('/analytics/dashboard', { params });
    return response.data.data;
  },

  getExpensesByCategory: async (params?: {
    startDate?: string;
    endDate?: string;
    period?: 'week' | 'month' | 'year' | 'all';
  }) => {
    const response = await api.get('/analytics/expenses/by-category', { params });
    return response.data.data;
  },

  getExpensesTrend: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<TrendData[]> => {
    const response = await api.get('/analytics/expenses/trend', { params });
    return response.data.data;
  },

  getIncomeTrend: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<TrendData[]> => {
    const response = await api.get('/analytics/income/trend', { params });
    return response.data.data;
  },

  getCashFlow: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CashFlowData[]> => {
    const response = await api.get('/analytics/cash-flow', { params });
    return response.data.data;
  },

  getMonthlyComparison: async (months?: number): Promise<MonthlyComparisonData[]> => {
    const response = await api.get('/analytics/monthly-comparison', {
      params: { months },
    });
    return response.data.data;
  },
};
