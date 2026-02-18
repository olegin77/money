import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket/client';
import { useAuthStore } from '@/stores/auth.store';

type EventCallback = (...args: unknown[]) => void;

export function useWebSocket() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        wsClient.connect(token);
      }
    } else {
      wsClient.disconnect();
    }

    return () => {
      wsClient.disconnect();
    };
  }, [isAuthenticated]);

  const on = (event: string, callback: EventCallback) => {
    wsClient.on(event, callback);
  };

  const off = (event: string, callback?: EventCallback) => {
    wsClient.off(event, callback);
  };

  const emit = (event: string, data: unknown) => {
    wsClient.emit(event, data);
  };

  return {
    on,
    off,
    emit,
    isConnected: wsClient.isConnected(),
  };
}
