'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { friendsApi, UserSearchResult } from '@/lib/api/friends';
import { UserPlus } from 'lucide-react';

interface UserSearchProps {
  onSendRequest: (userId: string) => void;
}

export function UserSearch({ onSendRequest }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchUsers();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const data = await friendsApi.searchUsers(query);
      setResults(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    try {
      await onSendRequest(userId);
      setResults(results.filter(u => u.id !== userId));
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        type="text"
        placeholder="Search by username or email…"
        aria-label="Search by username or email"
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
      />

      {loading && (
        <p className="text-muted-foreground text-center text-sm" role="status">
          Searching…
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map(user => (
            <div
              key={user.id}
              className="border-border flex items-center gap-3 rounded-lg border px-3 py-2.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">{user.username}</p>
                <p className="text-muted-foreground truncate text-xs">{user.email}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendRequest(user.id)}
                disabled={sendingTo === user.id}
                aria-label={`Add friend: ${user.username}`}
                className="h-8 shrink-0 px-2.5 text-xs"
              >
                <UserPlus size={13} aria-hidden="true" />
                {sendingTo === user.id ? 'Sending…' : 'Add'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <p className="text-muted-foreground text-center text-sm">No users found</p>
      )}
    </div>
  );
}
