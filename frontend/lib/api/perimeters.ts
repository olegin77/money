import { api } from './client';

export interface Perimeter {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  budget?: number;
  budgetPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  ownerId: string;
  isShared: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sharedRole?: 'viewer' | 'contributor' | 'manager';
}

export interface CreatePerimeterData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  budget?: number;
  budgetPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface PerimeterShare {
  id: string;
  perimeterId: string;
  sharedWithId: string;
  sharedWith: {
    id: string;
    username: string;
    email: string;
  };
  role: 'viewer' | 'contributor' | 'manager';
  createdAt: string;
}

export interface BudgetStatus {
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  period?: string;
  startDate: string;
  endDate: string;
}

export const perimetersApi = {
  create: async (data: CreatePerimeterData): Promise<Perimeter> => {
    const response = await api.post('/perimeters', data);
    return response.data.data;
  },

  findAll: async (): Promise<Perimeter[]> => {
    const response = await api.get('/perimeters');
    return response.data.data;
  },

  findOne: async (id: string): Promise<Perimeter> => {
    const response = await api.get(`/perimeters/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreatePerimeterData>): Promise<Perimeter> => {
    const response = await api.patch(`/perimeters/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/perimeters/${id}`);
  },

  share: async (
    id: string,
    userId: string,
    role: 'viewer' | 'contributor' | 'manager'
  ): Promise<PerimeterShare> => {
    const response = await api.post(`/perimeters/${id}/share`, { userId, role });
    return response.data.data;
  },

  unshare: async (id: string, userId: string): Promise<void> => {
    await api.delete(`/perimeters/${id}/share/${userId}`);
  },

  getShares: async (id: string): Promise<PerimeterShare[]> => {
    const response = await api.get(`/perimeters/${id}/shares`);
    return response.data.data;
  },

  getBudgetStatus: async (id: string): Promise<BudgetStatus> => {
    const response = await api.get(`/perimeters/${id}/budget-status`);
    return response.data.data;
  },
};
