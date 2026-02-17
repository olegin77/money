import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api/auth';

export function useAuth(requireAuth = false) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          setUser(null);
          setLoading(false);
          if (requireAuth) {
            router.push('/login');
          }
          return;
        }

        const userData = await authApi.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        logout();
        if (requireAuth) {
          router.push('/login');
        }
      }
    };

    if (isLoading) {
      loadUser();
    }
  }, [isLoading, requireAuth, router, setUser, setLoading, logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: async () => {
      await authApi.logout();
      logout();
      router.push('/login');
    },
  };
}
