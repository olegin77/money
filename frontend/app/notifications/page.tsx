'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { Notification } from '@/lib/api/notifications';
import { PageFadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { BellOff, Check, CheckCheck, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from '@/hooks/use-toast';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/hooks/use-notifications';

export default function NotificationsPage() {
  const { isLoading: authLoading } = useAuth(true);
  const t = useT();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications(page, 20);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotifMutation = useDeleteNotification();

  const handleMarkRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotifMutation.mutateAsync(id);
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (authLoading || isLoading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-8">
          <Skeleton className="h-8 w-48" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </ResponsiveContainer>
    );
  }

  const notifications = data?.items || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <ResponsiveContainer>
      <PageFadeIn className="p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-foreground text-2xl font-bold">{t('nav_notifications')}</h1>
              {data && data.unread > 0 && (
                <p className="text-muted-foreground mt-0.5 text-sm">{data.unread} unread</p>
              )}
            </div>
            {data && data.unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-8 gap-1 text-xs"
              >
                <CheckCheck size={13} />
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications list */}
          {notifications.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="All caught up"
              description="No notifications yet. We'll let you know when something happens."
              iconColor="text-zinc-400"
            />
          ) : (
            <StaggerContainer className="space-y-2">
              {notifications.map((notif: Notification) => (
                <StaggerItem key={notif.id}>
                  <Card className={notif.isRead ? 'opacity-60' : 'border-indigo-500/20'}>
                    <CardContent className="flex items-start gap-3 py-3">
                      <div
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          notif.isRead ? 'bg-transparent' : 'bg-indigo-500'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground text-sm font-medium">{notif.title}</p>
                        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-muted-foreground mt-1 text-[10px]">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkRead(notif.id)}
                            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                            aria-label="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-muted-foreground rounded p-1 transition-colors hover:text-red-500"
                          aria-label="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                {t('exp_prev')}
              </Button>
              <span className="text-muted-foreground text-sm">
                {t('exp_page')} {page} {t('exp_of')} {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                {t('exp_next')}
              </Button>
            </div>
          )}
        </div>
      </PageFadeIn>
    </ResponsiveContainer>
  );
}
