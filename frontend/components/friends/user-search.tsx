'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { friendsApi, UserSearchResult } from '@/lib/api/friends';

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
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    try {
      await onSendRequest(userId);
      setResults(results.filter((u) => u.id !== userId));
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        type="text"
        placeholder="Search by username or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Searching...</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <Card key={user.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendRequest(user.id)}
                disabled={sendingTo === user.id}
              >
                {sendingTo === user.id ? 'Sending...' : 'Add Friend'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No users found</p>
      )}
    </div>
  );
}
