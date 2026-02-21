'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notificationsApi, Notification } from '@/lib/api/notifications';
import { useAuthStore } from '@/stores/auth.store';
import { useT } from '@/hooks/use-t';
import { wsClient } from '@/lib/websocket/client';

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const t = useT();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silent — might not be connected yet
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Listen for real-time notifications via WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleWsNotification = (...args: unknown[]) => {
      const data = (args[0] || {}) as Partial<Notification>;
      setUnreadCount(prev => prev + 1);
      // Prepend to list if panel is open
      setNotifications(prev => {
        if (prev.length === 0) return prev; // not loaded yet
        const newNotif: Notification = {
          id: data.id || crypto.randomUUID(),
          type: data.type || 'system',
          title: data.title || '',
          message: data.message || '',
          data: data.data,
          isRead: false,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        return [newNotif, ...prev];
      });
    };
    wsClient.on('notification', handleWsNotification);
    return () => {
      wsClient.off('notification', handleWsNotification);
    };
  }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationsApi.findAll(1, 30);
      setNotifications(result.items);
      setUnreadCount(result.unread);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const wasUnread = notifications.find(n => n.id === id && !n.isRead);
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleToggle}
        aria-label={`${t('nav_notifications')}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
        aria-expanded={open}
        className="relative rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <Bell size={18} className="text-muted-foreground" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
            aria-live="polite"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="bg-card border-border absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">{t('nav_notifications') || 'Notifications'}</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  aria-label={t('aria_mark_all_read')}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Check size={12} aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {t('nav_notifications') === 'Уведомления' ? 'Прочитать все' : 'Mark all read'}
                  </span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label={t('aria_close_notifications')}
                className="text-muted-foreground rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="divide-border max-h-80 divide-y overflow-y-auto">
            {loading ? (
              <div className="text-muted-foreground py-8 text-center text-sm" role="status">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center text-sm">
                {t('nav_notifications') === 'Уведомления'
                  ? 'Уведомлений пока нет'
                  : 'No notifications yet'}
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    'group flex gap-3 px-4 py-3 transition-colors',
                    !n.isRead && 'bg-indigo-50/50 dark:bg-indigo-950/20'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', !n.isRead && 'font-semibold')}>{n.title}</p>
                    {n.message && (
                      <p className="text-muted-foreground mt-0.5 text-xs">{n.message}</p>
                    )}
                    <p className="text-muted-foreground mt-1 text-xs">{formatTime(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        aria-label={t('aria_mark_read')}
                        className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Check size={14} className="text-muted-foreground" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      aria-label={t('aria_delete_notification')}
                      className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={14} className="text-muted-foreground" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
