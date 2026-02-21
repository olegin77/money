import { api } from './client';

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  categoryId?: string;
  date: string;
  paymentMethod?: string;
  location?: string;
  tags?: string[];
  isRecurring: boolean;
  recurrenceRule?: string;
  attachments?: string[];
  receiptUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  amount: number;
  currency?: string;
  description?: string;
  categoryId?: string;
  date: string;
  paymentMethod?: string;
  location?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurrenceRule?: string;
  attachments?: string[];
}

export interface QueryExpenseParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ExpenseStats {
  total: number;
  count: number;
  average: number;
  byCategory: Record<string, { total: number; count: number }>;
}

export interface ExpenseTrend {
  date: string;
  total: number;
}

export const expensesApi = {
  create: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data.data;
  },

  createBatch: async (expenses: CreateExpenseData[]): Promise<Expense[]> => {
    const response = await api.post('/expenses/batch', { expenses });
    return response.data.data;
  },

  findAll: async (params?: QueryExpenseParams) => {
    const response = await api.get('/expenses', { params });
    return response.data.data;
  },

  findOne: async (id: string): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateExpenseData>): Promise<Expense> => {
    const response = await api.patch(`/expenses/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },

  getStats: async (startDate?: string, endDate?: string): Promise<ExpenseStats> => {
    const response = await api.get('/expenses/stats', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getTrend: async (days?: number): Promise<ExpenseTrend[]> => {
    const response = await api.get('/expenses/trend', {
      params: { days },
    });
    return response.data.data;
  },

  uploadReceipt: async (expenseId: string, file: File): Promise<{ receiptUrl: string }> => {
    const formData = new FormData();
    formData.append('receipt', file);
    const response = await api.post(`/expenses/${expenseId}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getReceiptUrl: (expenseId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    return `${baseUrl}/expenses/${expenseId}/receipt`;
  },
};
