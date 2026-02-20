'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Income, CreateIncomeData } from '@/lib/api/income';
import { useIncome, useCreateIncome, useUpdateIncome, useDeleteIncome } from '@/hooks/use-income';
import { Plus, Search, X } from 'lucide-react';
import { PageFadeIn } from '@/components/ui/motion';

export default function IncomePage() {
  const { isLoading: authLoading } = useAuth(true);
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data, isLoading } = useIncome({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const createMutation = useCreateIncome();
  const updateMutation = useUpdateIncome();
  const deleteMutation = useDeleteIncome();

  const incomes = data?.items || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const openForm = useCallback(() => setShowForm(true), []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

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

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = search || startDate || endDate;

  const handleCreate = async (data: CreateIncomeData) => {
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
      toast.success(t('toast_income_created'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleUpdate = async (data: CreateIncomeData) => {
    if (!editingIncome) return;
    try {
      await updateMutation.mutateAsync({ id: editingIncome.id, data });
      setEditingIncome(null);
      toast.success(t('toast_income_updated'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('toast_confirm_delete'))) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t('toast_income_deleted'));
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
          <div className="mb-6 hidden items-center justify-between md:flex">
            <div>
              <h1 className="text-foreground text-2xl font-bold">{t('inc_title')}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{t('inc_empty_sub')}</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={15} /> {t('inc_new')}
            </Button>
          </div>

          {/* Search & filters */}
          <div className="mb-4 space-y-2">
            <div className="relative">
              <Search
                size={16}
                className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('filter_search')}
                aria-label={t('filter_search')}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                aria-label="Start date"
                onChange={e => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="border-border bg-card text-foreground flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <span className="text-muted-foreground text-xs">{t('filter_to')}</span>
              <input
                type="date"
                value={endDate}
                aria-label="End date"
                onChange={e => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="border-border bg-card text-foreground flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  aria-label={t('filter_clear')}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors"
                >
                  <X size={14} />
                  {t('filter_clear')}
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
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
