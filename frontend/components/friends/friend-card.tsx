'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Friend } from '@/lib/api/friends';
import { format } from 'date-fns';

interface FriendCardProps {
  friend: Friend;
  onRemove: (friendshipId: string) => void;
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white">
          {friend.friend.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{friend.friend.username}</p>
          {friend.friend.fullName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{friend.friend.fullName}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Friends since {format(new Date(friend.since), 'MMM yyyy')}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(friend.friendshipId)}
        className="text-red-500 hover:text-red-600"
      >
        Remove
      </Button>
    </Card>
  );
}
