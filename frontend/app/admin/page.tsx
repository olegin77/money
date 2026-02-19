'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/analytics/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi, AdminUserData, AdminStats } from '@/lib/api/admin';

interface AuditLogEntry {
  id: string;
  userId: string;
  method: string;
  path: string;
  entity: string;
  entityId: string | null;
  statusCode: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth(true);
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Audit logs
  const [tab, setTab] = useState<'users' | 'audit'>('users');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user?.isAdmin) loadData();
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
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const data = await adminApi.getAuditLogs({ page: auditPage, limit: 30 });
      setAuditLogs(data.items);
      setAuditTotalPages(data.pagination.totalPages);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'audit' && user?.isAdmin) loadAuditLogs();
  }, [tab, auditPage, user]);

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUser(userId, { isActive: !isActive });
      toast.success('User updated');
      loadData();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    if (!confirm(`${isAdmin ? 'Remove' : 'Grant'} admin access?`)) return;
    try {
      await adminApi.updateUser(userId, { isAdmin: !isAdmin });
      toast.success('User updated');
      loadData();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted');
      loadData();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  if (authLoading || !user?.isAdmin) {
    return (
      <div className="bg-page flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-page min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-foreground text-2xl font-bold">Admin</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">System management</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          stats && (
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <StatCard
                title="Total users"
                value={stats.totalUsers}
                icon="👥"
                className="border-indigo-600 bg-indigo-600 text-white"
              />
              <StatCard title="Active" value={stats.activeUsers} icon="✅" />
              <StatCard title="Verified" value={stats.verifiedUsers} icon="✉️" />
              <StatCard title="Admins" value={stats.adminUsers} icon="👑" />
              <StatCard title="2FA" value={stats.users2FA} icon="🔐" />
              <StatCard title="New (7d)" value={stats.recentUsers} icon="🆕" />
            </div>
          )
        )}

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {(['users', 'audit'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'users' ? 'Users' : 'Audit Logs'}
            </button>
          ))}
        </div>

        {/* Users */}
        {tab === 'users' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Users</CardTitle>
                <Input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 max-w-48 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {users.map(userData => (
                    <div key={userData.id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                          <p className="text-foreground text-sm font-medium">{userData.username}</p>
                          {userData.isAdmin && (
                            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-xs text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                              Admin
                            </span>
                          )}
                          {!userData.isActive && (
                            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                              Inactive
                            </span>
                          )}
                          {userData.emailVerified && (
                            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                              Verified
                            </span>
                          )}
                          {userData.twoFaEnabled && (
                            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              2FA
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">{userData.email}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(userData.id, userData.isActive)}
                          className="h-7 px-2 text-xs"
                        >
                          {userData.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleAdmin(userData.id, userData.isAdmin)}
                          className="h-7 px-2 text-xs"
                        >
                          {userData.isAdmin ? '−Admin' : '+Admin'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(userData.id)}
                          className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          Del
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Audit Logs */}
        {tab === 'audit' && (
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : auditLogs.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">No audit logs yet</p>
              ) : (
                <div className="divide-border divide-y">
                  {auditLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className={`inline-flex h-7 w-16 shrink-0 items-center justify-center rounded text-xs font-bold ${
                          log.method === 'DELETE'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : log.method === 'POST'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {log.method}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">{log.path}</p>
                        <p className="text-muted-foreground text-xs">
                          {log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''} &middot;{' '}
                          {log.statusCode} &middot; {log.ipAddress}
                        </p>
                      </div>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {auditTotalPages > 1 && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                    disabled={auditPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {auditPage} / {auditTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAuditPage(p => Math.min(auditTotalPages, p + 1))}
                    disabled={auditPage === auditTotalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
