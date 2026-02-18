'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IncomeForm } from '@/components/income/income-form';
import { IncomeList } from '@/components/income/income-list';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { incomeApi, Income, CreateIncomeData } from '@/lib/api/income';
import { Plus } from 'lucide-react';

export default function IncomePage() {
  const { isLoading: authLoading } = useAuth(true);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading) loadIncomes();
  }, [authLoading, page]);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const result = await incomeApi.findAll({ page, limit: 20 });
      setIncomes(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateIncomeData) => {
    await incomeApi.create(data);
    setShowForm(false);
    loadIncomes();
  };

  const handleUpdate = async (data: CreateIncomeData) => {
    if (!editingIncome) return;
    await incomeApi.update(editingIncome.id, data);
    setEditingIncome(null);
    loadIncomes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this income entry?')) return;
    await incomeApi.delete(id);
    loadIncomes();
  };

  if (authLoading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-2xl space-y-3 p-4 md:p-8">
          <Skeleton className="h-8 w-24" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Desktop header */}
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="text-foreground text-2xl font-bold">Income</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">Track your earnings</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={15} /> New income
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <IncomeList
                incomes={incomes}
                onEdit={income => setEditingIncome(income)}
                onDelete={handleDelete}
              />

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
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
            </>
          )}
        </div>
      </div>

      <FloatingActionButton onClick={() => setShowForm(true)} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New income</DialogTitle>
          </DialogHeader>
          <IncomeForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingIncome} onOpenChange={open => !open && setEditingIncome(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit income</DialogTitle>
          </DialogHeader>
          {editingIncome && (
            <IncomeForm
              onSubmit={handleUpdate}
              onCancel={() => setEditingIncome(null)}
              initialData={editingIncome}
            />
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
}
