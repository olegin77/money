'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FriendCard } from '@/components/friends/friend-card';
import { RequestCard } from '@/components/friends/request-card';
import { UserSearch } from '@/components/friends/user-search';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFriends,
  usePendingRequests,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
} from '@/hooks/use-friends';
import { UserPlus, Users } from 'lucide-react';
import { PageFadeIn } from '@/components/ui/motion';
import { EmptyState } from '@/components/ui/empty-state';

export default function FriendsPage() {
  const { isLoading: authLoading } = useAuth(true);
  const t = useT();
  const [showSearch, setShowSearch] = useState(false);

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: pendingRequests = [], isLoading: requestsLoading } = usePendingRequests();
  const sendRequestMutation = useSendFriendRequest();
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const removeMutation = useRemoveFriend();

  const loading = authLoading || friendsLoading || requestsLoading;

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequestMutation.mutateAsync(userId);
      setShowSearch(false);
      toast.success(t('toast_friend_request_sent'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptMutation.mutateAsync(requestId);
      toast.success(t('toast_friend_accepted'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectMutation.mutateAsync(requestId);
      toast.success(t('toast_friend_rejected'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleRemove = async (friendshipId: string) => {
    if (!confirm(t('toast_confirm_delete'))) return;
    try {
      await removeMutation.mutateAsync(friendshipId);
      toast.success(t('toast_friend_removed'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-2xl space-y-3 p-4 md:p-8">
          <Skeleton className="h-8 w-28" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <PageFadeIn className="p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Desktop header */}
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="text-foreground text-2xl font-bold">{t('fri_title')}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{t('fri_no_friends_sub')}</p>
            </div>
            <Button onClick={() => setShowSearch(true)}>
              <UserPlus size={15} /> {t('fri_add')}
            </Button>
          </div>

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t('fri_pending')}
                  </p>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                    {pendingRequests.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {pendingRequests.map(request => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Friends list */}
          {friends.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
                {t('fri_your')} · {friends.length}
              </p>
              <div className="space-y-2">
                {friends.map(friend => (
                  <FriendCard key={friend.friendshipId} friend={friend} onRemove={handleRemove} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Users}
              title={t('fri_no_friends')}
              description={t('fri_no_friends_sub')}
              actionLabel={t('fri_add')}
              onAction={() => setShowSearch(true)}
              iconColor="text-violet-500"
            />
          )}
        </div>
      </PageFadeIn>

      <FloatingActionButton onClick={() => setShowSearch(true)} />

      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('fri_add')}</DialogTitle>
          </DialogHeader>
          <UserSearch onSendRequest={handleSendRequest} />
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
}
