'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/analytics/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi, AdminUserData, AdminStats } from '@/lib/api/admin';

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth(true);
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user?.isAdmin) {
      loadData();
    }
  }, [authLoading, user, page, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ page, limit: 20, search }),
      ]);
      setStats(statsData);
      setUsers(usersData.items);
      setTotalPages(usersData.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUser(userId, { isActive: !isActive });
      loadData();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    if (!confirm(`${isAdmin ? 'Remove' : 'Grant'} admin access?`)) return;

    try {
      await adminApi.updateUser(userId, { isAdmin: !isAdmin });
      loadData();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Permanently delete this user? This action cannot be undone.')) return;

    try {
      await adminApi.deleteUser(userId);
      loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (authLoading || loading || !user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">System management & user control</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="👥"
              className="aurora-gradient text-white"
            />
            <StatCard title="Active" value={stats.activeUsers} icon="✅" />
            <StatCard title="Verified" value={stats.verifiedUsers} icon="✉️" />
            <StatCard title="Admins" value={stats.adminUsers} icon="👑" />
            <StatCard title="2FA Enabled" value={stats.users2FA} icon="🔐" />
            <StatCard title="New (7d)" value={stats.recentUsers} icon="🆕" />
          </div>
        )}

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>User Management</span>
              <Input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((userData) => (
                <div
                  key={userData.id}
                  className="flex items-center justify-between p-4 glass rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{userData.username}</p>
                      {userData.isAdmin && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-500">
                          Admin
                        </span>
                      )}
                      {!userData.isActive && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-500">
                          Inactive
                        </span>
                      )}
                      {userData.emailVerified && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                          Verified
                        </span>
                      )}
                      {userData.twoFaEnabled && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                          2FA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{userData.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Joined: {new Date(userData.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(userData.id, userData.isActive)}
                    >
                      {userData.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAdmin(userData.id, userData.isAdmin)}
                    >
                      {userData.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteUser(userData.id)}
                      className="text-red-500"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
