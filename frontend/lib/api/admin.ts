import { api } from './client';

export interface AdminUserData {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  isActive: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
  twoFaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  users2FA: number;
  recentUsers: number;
}

export const adminApi = {
  getUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/users/stats');
    return response.data.data;
  },

  getUserById: async (id: string): Promise<AdminUserData> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  },

  updateUser: async (
    id: string,
    data: { isActive?: boolean; isAdmin?: boolean; emailVerified?: boolean }
  ): Promise<AdminUserData> => {
    const response = await api.patch(`/admin/users/${id}`, data);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    method?: string;
    entity?: string;
  }) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data.data;
  },
};
