'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Friend } from '@/lib/api/friends';
import { format } from 'date-fns';
import { useT } from '@/hooks/use-t';

interface FriendCardProps {
  friend: Friend;
  onRemove: (friendshipId: string) => void;
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
  const t = useT();
  const initial = friend.friend.username.charAt(0).toUpperCase();

  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {initial}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium">{friend.friend.username}</p>
        <p className="text-muted-foreground text-xs">
          {friend.friend.fullName ? `${friend.friend.fullName} · ` : ''}
          Since {format(new Date(friend.since), 'MMM yyyy')}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(friend.friendshipId)}
        aria-label={`${t('aria_remove_friend')}: ${friend.friend.username}`}
        className="h-8 shrink-0 px-2.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
      >
        Remove
      </Button>
    </Card>
  );
}
