'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { wsClient } from '@/lib/websocket/client';
import { toast } from '@/hooks/use-toast';

export function WebSocketProvider() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      wsClient.disconnect();
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    wsClient.connect(token);

    // Listen for real-time notifications and show toast
    const handleNotification = (...args: unknown[]) => {
      const data = (args[0] || {}) as { title?: string; message?: string };
      toast({
        title: data.title || 'New notification',
        description: data.message,
      });
    };

    wsClient.on('notification', handleNotification);

    return () => {
      wsClient.off('notification', handleNotification);
    };
  }, [isAuthenticated]);

  return null;
}
