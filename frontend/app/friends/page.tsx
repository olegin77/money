'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FriendCard } from '@/components/friends/friend-card';
import { RequestCard } from '@/components/friends/request-card';
import { UserSearch } from '@/components/friends/user-search';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { friendsApi, Friend, FriendRequest } from '@/lib/api/friends';

export default function FriendsPage() {
  const { isLoading: authLoading } = useAuth(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [_loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getPendingRequests(),
      ]);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Failed to load friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendsApi.sendRequest(userId);
      setShowSearch(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send friend request');
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await friendsApi.acceptRequest(requestId);
      loadData();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await friendsApi.rejectRequest(requestId);
      loadData();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleRemove = async (friendshipId: string) => {
    if (!confirm('Remove this friend?')) return;

    try {
      await friendsApi.removeFriend(friendshipId);
      loadData();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  if (authLoading) {
    return (
      <ResponsiveContainer>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="font-satoshi mb-2 text-4xl font-bold">Friends</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect and share expenses with friends
              </p>
            </div>
            <Button onClick={() => setShowSearch(true)}>+ Add Friend</Button>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Friend Requests
                  <span className="bg-primary/20 text-primary rounded-full px-2 py-1 text-sm">
                    {pendingRequests.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRequests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          {friends.length > 0 ? (
            <div className="space-y-3">
              <h2 className="mb-4 text-xl font-bold">My Friends ({friends.length})</h2>
              {friends.map(friend => (
                <FriendCard key={friend.friendshipId} friend={friend} onRemove={handleRemove} />
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <div className="mb-4 text-5xl">👥</div>
              <p className="mb-2 text-xl font-semibold">No friends yet</p>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Add friends to share expenses and categories
              </p>
              <Button onClick={() => setShowSearch(true)}>Add Your First Friend</Button>
            </Card>
          )}

          {/* Search Dialog */}
          <Dialog open={showSearch} onOpenChange={setShowSearch}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Friend</DialogTitle>
              </DialogHeader>
              <UserSearch onSendRequest={handleSendRequest} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <FloatingActionButton onClick={() => setShowSearch(true)} />
    </ResponsiveContainer>
  );
}
