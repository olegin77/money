import { api } from './client';
import type { User } from './auth';

export interface UpdateProfileData {
  fullName?: string;
  currency?: string;
  language?: string;
  themeMode?: 'light' | 'dark';
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch('/users/me', data);
    return response.data.data;
  },

  exportData: async (): Promise<void> => {
    const response = await api.get('/users/me/export', { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
