import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    fullName: 'Test User',
    currency: 'USD',
    isActive: true,
    role: 'user' as const,
  };

  it('should start with null user and isLoading true', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('should set user and mark as authenticated', () => {
    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should clear user when set to null', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setUser(null);

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update user partially', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().updateUser({ currency: 'EUR' });

    const state = useAuthStore.getState();
    expect(state.user?.currency).toBe('EUR');
    expect(state.user?.email).toBe('test@test.com');
  });

  it('should not crash when updating with no user', () => {
    useAuthStore.getState().updateUser({ currency: 'EUR' });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });

  it('should logout and clear all state', () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(false);

    expect(useAuthStore.getState().isLoading).toBe(false);

    useAuthStore.getState().setLoading(true);

    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});
