'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IncomeForm } from '@/components/income/income-form';
import { IncomeList } from '@/components/income/income-list';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { incomeApi, Income, CreateIncomeData } from '@/lib/api/income';
import { Plus } from 'lucide-react';
import { PageFadeIn } from '@/components/ui/motion';

export default function IncomePage() {
  const { isLoading: authLoading } = useAuth(true);
  const t = useT();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const openForm = useCallback(() => setShowForm(true), []);

  useEffect(() => {
    if (!authLoading) loadIncomes();
  }, [authLoading, page]);

  // Open form via keyboard shortcut event or URL param
  useEffect(() => {
    window.addEventListener('shortcut:open-form', openForm);

    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setShowForm(true);
      window.history.replaceState({}, '', '/income');
    }

    return () => window.removeEventListener('shortcut:open-form', openForm);
  }, [openForm]);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const result = await incomeApi.findAll({ page, limit: 20 });
      setIncomes(result.items);
      setTotalPages(result.pagination.totalPages);
    } catch {
      toast.error(t('toast_error_load'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateIncomeData) => {
    try {
      await incomeApi.create(data);
      setShowForm(false);
      toast.success(t('toast_income_created'));
      loadIncomes();
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleUpdate = async (data: CreateIncomeData) => {
    if (!editingIncome) return;
    try {
      await incomeApi.update(editingIncome.id, data);
      setEditingIncome(null);
      toast.success(t('toast_income_updated'));
      loadIncomes();
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('toast_confirm_delete'))) return;
    try {
      await incomeApi.delete(id);
      toast.success(t('toast_income_deleted'));
      loadIncomes();
    } catch {
      toast.error(t('toast_error'));
    }
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
      <PageFadeIn className="p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          {/* Desktop header */}
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="text-foreground text-2xl font-bold">{t('inc_title')}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{t('inc_empty_sub')}</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={15} /> {t('inc_new')}
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
            <DialogTitle>{t('inc_new')}</DialogTitle>
          </DialogHeader>
          <IncomeForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingIncome} onOpenChange={open => !open && setEditingIncome(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inc_title')}</DialogTitle>
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
