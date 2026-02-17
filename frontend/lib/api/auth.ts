import { api, apiClient } from './client';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  currency?: string;
  language?: string;
}

export interface LoginData {
  email: string;
  password: string;
  twoFaCode?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  requires2FA?: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  currency: string;
  language: string;
  themeMode: 'light' | 'dark';
  emailVerified: boolean;
  twoFaEnabled: boolean;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);

    if (response.data.success && response.data.data?.tokens) {
      apiClient.setAccessToken(response.data.data.tokens.accessToken);
      apiClient.setRefreshToken(response.data.data.tokens.refreshToken);
    }

    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);

    if (response.data.success && response.data.data?.tokens) {
      apiClient.setAccessToken(response.data.data.tokens.accessToken);
      apiClient.setRefreshToken(response.data.data.tokens.refreshToken);
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    apiClient.clearTokens();
  },

  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
    apiClient.clearTokens();
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  generate2FA: async (): Promise<{ secret: string; qrCode: string }> => {
    const response = await api.post('/auth/2fa/generate');
    return response.data.data;
  },

  enable2FA: async (code: string): Promise<void> => {
    await api.post('/auth/2fa/enable', { code });
  },

  disable2FA: async (code: string): Promise<void> => {
    await api.post('/auth/2fa/disable', { code });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },
};
