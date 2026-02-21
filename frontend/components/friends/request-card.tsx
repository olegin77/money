'use client';

import { Button } from '@/components/ui/button';
import { FriendRequest } from '@/lib/api/friends';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { useT } from '@/hooks/use-t';

interface RequestCardProps {
  request: FriendRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function RequestCard({ request, onAccept, onReject }: RequestCardProps) {
  const t = useT();
  const initial = request.requester.username.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          {initial}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium">{request.requester.username}</p>
        <p className="text-muted-foreground text-xs">
          {format(new Date(request.createdAt), 'MMM d, yyyy')}
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button
          size="sm"
          variant="success"
          onClick={() => onAccept(request.id)}
          aria-label={`${t('aria_accept_request')}: ${request.requester.username}`}
          className="h-8 w-8 p-0"
        >
          <Check size={14} aria-hidden="true" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onReject(request.id)}
          aria-label={`${t('aria_reject_request')}: ${request.requester.username}`}
          className="h-8 w-8 p-0"
        >
          <X size={14} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
