// Shared TypeScript types for FinTrack Pro

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
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  categoryId?: string;
  date: Date;
  paymentMethod?: string;
  location?: string;
  tags?: string[];
  isRecurring: boolean;
  recurrenceRule?: string;
  attachments?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  source?: string;
  date: Date;
  tags?: string[];
  isRecurring: boolean;
  recurrenceRule?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Perimeter {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  budget?: number;
  budgetPeriod?: string;
  ownerId: string;
  isShared: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
