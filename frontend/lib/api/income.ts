import { api } from './client';

export interface Income {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  source?: string;
  date: string;
  tags?: string[];
  isRecurring: boolean;
  recurrenceRule?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeData {
  amount: number;
  currency?: string;
  description?: string;
  source?: string;
  date: string;
  tags?: string[];
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export interface QueryIncomeParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface IncomeStats {
  total: number;
  count: number;
  average: number;
  bySource: Record<string, { total: number; count: number }>;
}

export interface IncomeTrend {
  date: string;
  total: number;
}

export const incomeApi = {
  create: async (data: CreateIncomeData): Promise<Income> => {
    const response = await api.post('/income', data);
    return response.data.data;
  },

  findAll: async (params?: QueryIncomeParams) => {
    const response = await api.get('/income', { params });
    return response.data.data;
  },

  findOne: async (id: string): Promise<Income> => {
    const response = await api.get(`/income/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateIncomeData>): Promise<Income> => {
    const response = await api.patch(`/income/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/income/${id}`);
  },

  getStats: async (startDate?: string, endDate?: string): Promise<IncomeStats> => {
    const response = await api.get('/income/stats', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getTrend: async (days?: number): Promise<IncomeTrend[]> => {
    const response = await api.get('/income/trend', {
      params: { days },
    });
    return response.data.data;
  },
};
