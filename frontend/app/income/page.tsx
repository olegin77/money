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

export default function IncomePage() {
  const { isLoading: authLoading } = useAuth(true);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      loadIncomes();
    }
  }, [authLoading, page]);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const result = await incomeApi.findAll({ page, limit: 20 });
      setIncomes(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateIncomeData) => {
    try {
      await incomeApi.create(data);
      setShowForm(false);
      loadIncomes();
    } catch (error) {
      console.error('Failed to create income:', error);
      throw error;
    }
  };

  const handleUpdate = async (data: CreateIncomeData) => {
    if (!editingIncome) return;
    try {
      await incomeApi.update(editingIncome.id, data);
      setEditingIncome(null);
      loadIncomes();
    } catch (error) {
      console.error('Failed to update income:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income?')) return;
    try {
      await incomeApi.delete(id);
      loadIncomes();
    } catch (error) {
      console.error('Failed to delete income:', error);
    }
  };

  if (authLoading) {
    return (
      <ResponsiveContainer>
        <div className="min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-4xl space-y-4">
            <Skeleton className="h-10 w-40" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          {/* Desktop Header */}
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="font-satoshi mb-2 text-4xl font-bold">Income</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your earnings</p>
            </div>
            <Button onClick={() => setShowForm(true)}>+ New Income</Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
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
                <div className="mt-6 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm tabular-nums text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
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

      {/* FAB for mobile */}
      <FloatingActionButton onClick={() => setShowForm(true)} />

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Income</DialogTitle>
          </DialogHeader>
          <IncomeForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingIncome} onOpenChange={open => !open && setEditingIncome(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
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
