'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FriendRequest } from '@/lib/api/friends';
import { format } from 'date-fns';

interface RequestCardProps {
  request: FriendRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function RequestCard({ request, onAccept, onReject }: RequestCardProps) {
  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white">
          {request.requester.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{request.requester.username}</p>
          {request.requester.fullName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{request.requester.fullName}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {format(new Date(request.createdAt), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onAccept(request.id)}
          className="bg-green-500 hover:bg-green-600"
        >
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReject(request.id)}>
          Decline
        </Button>
      </div>
    </Card>
  );
}
