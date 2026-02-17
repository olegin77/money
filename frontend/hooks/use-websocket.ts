import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket/client';
import { useAuthStore } from '@/stores/auth.store';

export function useWebSocket() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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

  const on = (event: string, callback: Function) => {
    wsClient.on(event, callback);
  };

  const off = (event: string, callback?: Function) => {
    wsClient.off(event, callback);
  };

  const emit = (event: string, data: any) => {
    wsClient.emit(event, data);
  };

  return {
    on,
    off,
    emit,
    isConnected: wsClient.isConnected(),
  };
}
