import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  updateUser: (patch: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: user =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      updateUser: patch =>
        set(state => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),

      setLoading: loading => set({ isLoading: loading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
