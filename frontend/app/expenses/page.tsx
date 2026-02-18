'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExpenseForm } from '@/components/expenses/expense-form';
import { ExpenseList } from '@/components/expenses/expense-list';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { expensesApi, Expense, CreateExpenseData } from '@/lib/api/expenses';

export default function ExpensesPage() {
  const { isLoading: authLoading } = useAuth(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      loadExpenses();
    }
  }, [authLoading, page]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const result = await expensesApi.findAll({ page, limit: 20 });
      setExpenses(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateExpenseData) => {
    try {
      await expensesApi.create(data);
      setShowForm(false);
      loadExpenses();
    } catch (error) {
      console.error('Failed to create expense:', error);
      throw error;
    }
  };

  const handleUpdate = async (data: CreateExpenseData) => {
    if (!editingExpense) return;
    try {
      await expensesApi.update(editingExpense.id, data);
      setEditingExpense(null);
      loadExpenses();
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expensesApi.delete(id);
      loadExpenses();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  if (authLoading) {
    return (
      <ResponsiveContainer>
        <div className="min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-4xl space-y-4">
            <Skeleton className="h-10 w-48" />
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
              <h1 className="font-satoshi mb-2 text-4xl font-bold">Expenses</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your spending</p>
            </div>
            <Button onClick={() => setShowForm(true)}>+ New Expense</Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
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
            <DialogTitle>New Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={open => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
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
