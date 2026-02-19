'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExpenseForm } from '@/components/expenses/expense-form';
import { ExpenseList } from '@/components/expenses/expense-list';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { expensesApi, Expense, CreateExpenseData } from '@/lib/api/expenses';
import { Plus } from 'lucide-react';
import { PageFadeIn } from '@/components/ui/motion';

export default function ExpensesPage() {
  const { isLoading: authLoading } = useAuth(true);
  const t = useT();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const openForm = useCallback(() => setShowForm(true), []);

  useEffect(() => {
    if (!authLoading) loadExpenses();
  }, [authLoading, page]);

  // Open form via keyboard shortcut event or URL param
  useEffect(() => {
    window.addEventListener('shortcut:open-form', openForm);

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setShowForm(true);
      window.history.replaceState({}, '', '/expenses');
    }

    return () => window.removeEventListener('shortcut:open-form', openForm);
  }, [openForm]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const result = await expensesApi.findAll({ page, limit: 20 });
      setExpenses(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch {
      toast.error(t('toast_error_load'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateExpenseData) => {
    try {
      await expensesApi.create(data);
      setShowForm(false);
      toast.success(t('toast_expense_created'));
      loadExpenses();
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleUpdate = async (data: CreateExpenseData) => {
    if (!editingExpense) return;
    try {
      await expensesApi.update(editingExpense.id, data);
      setEditingExpense(null);
      toast.success(t('toast_expense_updated'));
      loadExpenses();
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('toast_confirm_delete'))) return;
    try {
      await expensesApi.delete(id);
      toast.success(t('toast_expense_deleted'));
      loadExpenses();
    } catch {
      toast.error(t('toast_error'));
    }
  };

  if (authLoading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-2xl space-y-3 p-4 md:p-8">
          <Skeleton className="h-8 w-32" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <PageFadeIn className="p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Desktop header */}
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="text-foreground text-2xl font-bold">{t('exp_title')}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{t('exp_empty_sub')}</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={15} /> {t('exp_new')}
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
              <ExpenseList
                expenses={expenses}
                onEdit={expense => setEditingExpense(expense)}
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
                    {t('exp_prev')}
                  </Button>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {t('exp_page')} {page} {t('exp_of')} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    {t('exp_next')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </PageFadeIn>

      <FloatingActionButton onClick={() => setShowForm(true)} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('exp_new')}</DialogTitle>
          </DialogHeader>
          <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingExpense} onOpenChange={open => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('exp_title')}</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm
              onSubmit={handleUpdate}
              onCancel={() => setEditingExpense(null)}
              initialData={editingExpense}
            />
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
}
