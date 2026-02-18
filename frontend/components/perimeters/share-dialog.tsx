'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Perimeter, PerimeterShare, perimetersApi } from '@/lib/api/perimeters';

interface ShareDialogProps {
  perimeter: Perimeter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ perimeter, open, onOpenChange }: ShareDialogProps) {
  const [shares, setShares] = useState<PerimeterShare[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'contributor' | 'manager'>('viewer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (perimeter && open) {
      loadShares();
    }
  }, [perimeter, open]);

  const loadShares = async () => {
    if (!perimeter) return;

    try {
      const data = await perimetersApi.getShares(perimeter.id);
      setShares(data);
    } catch (error) {
      console.error('Failed to load shares:', error);
    }
  };

  const handleShare = async () => {
    if (!perimeter || !email) return;

    setLoading(true);
    try {
      // In a real app, you'd search for user by email first
      // For now, we'll need the userId from somewhere
      // This is a placeholder implementation
      alert('Note: In production, implement user search by email first');

      // await perimetersApi.share(perimeter.id, userId, role);
      // loadShares();
      setEmail('');
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async (userId: string) => {
    if (!perimeter) return;

    if (!confirm('Remove access for this user?')) return;

    try {
      await perimetersApi.unshare(perimeter.id, userId);
      loadShares();
    } catch (error) {
      console.error('Failed to unshare:', error);
    }
  };

  if (!perimeter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share "{perimeter.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add User Form */}
          <div className="glass space-y-4 rounded-xl p-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Permission Level</Label>
              <select
                id="role"
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="bg-background flex h-12 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm dark:border-gray-700"
                disabled={loading}
              >
                <option value="viewer">Viewer (View only)</option>
                <option value="contributor">Contributor (Can add expenses)</option>
                <option value="manager">Manager (Can manage & share)</option>
              </select>
            </div>

            <Button onClick={handleShare} className="w-full" disabled={loading || !email}>
              {loading ? 'Sharing...' : 'Share'}
            </Button>
          </div>

          {/* Current Shares */}
          {shares.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Shared with ({shares.length})
              </h3>
              {shares.map(share => (
                <div
                  key={share.id}
                  className="glass flex items-center justify-between rounded-xl p-3"
                >
                  <div>
                    <p className="font-medium">{share.sharedWith.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {share.sharedWith.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/20 text-primary rounded-full px-2 py-1 text-xs">
                      {share.role}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUnshare(share.sharedWithId)}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {shares.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Not shared with anyone yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
