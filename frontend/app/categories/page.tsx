'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useT } from '@/hooks/use-t';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PerimeterForm } from '@/components/perimeters/perimeter-form';
import { PerimeterCard } from '@/components/perimeters/perimeter-card';
import { ShareDialog } from '@/components/perimeters/share-dialog';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Perimeter, CreatePerimeterData } from '@/lib/api/perimeters';
import {
  usePerimeters,
  useCreatePerimeter,
  useUpdatePerimeter,
  useDeletePerimeter,
} from '@/hooks/use-perimeters';
import { CategoryGrid } from '@/components/categories/category-grid';
import { FolderOpen, Plus } from 'lucide-react';
import { PageFadeIn } from '@/components/ui/motion';

export default function CategoriesPage() {
  const { isLoading: authLoading } = useAuth(true);
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [editingPerimeter, setEditingPerimeter] = useState<Perimeter | null>(null);
  const [sharingPerimeter, setSharingPerimeter] = useState<Perimeter | null>(null);

  const { data: perimeters = [], isLoading } = usePerimeters();
  const createMutation = useCreatePerimeter();
  const updateMutation = useUpdatePerimeter();
  const deleteMutation = useDeletePerimeter();

  const handleCreate = async (data: CreatePerimeterData) => {
    try {
      await createMutation.mutateAsync(data);
      setShowForm(false);
      toast.success(t('toast_category_created'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleUpdate = async (data: CreatePerimeterData) => {
    if (!editingPerimeter) return;
    try {
      await updateMutation.mutateAsync({ id: editingPerimeter.id, data });
      setEditingPerimeter(null);
      toast.success(t('toast_category_updated'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('toast_confirm_delete'))) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t('toast_category_deleted'));
    } catch {
      toast.error(t('toast_error'));
    }
  };

  if (authLoading || isLoading) {
    return (
      <ResponsiveContainer>
        <div className="mx-auto max-w-5xl space-y-3 p-4 md:p-8">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  const ownedPerimeters = perimeters.filter(p => !p.sharedRole);
  const sharedPerimeters = perimeters.filter(p => p.sharedRole);

  return (
    <ResponsiveContainer>
      <PageFadeIn className="p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          {/* Desktop header */}
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="text-foreground text-2xl font-bold">{t('cat_title')}</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{t('cat_add_first')}</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus size={15} /> {t('cat_new')}
            </Button>
          </div>

          {/* Empty state */}
          {perimeters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <FolderOpen size={22} className="text-muted-foreground" />
              </div>
              <p className="text-foreground mb-1 text-base font-semibold">{t('cat_no_expenses')}</p>
              <p className="text-muted-foreground mb-6 max-w-xs text-sm">{t('cat_add_first')}</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus size={15} /> {t('cat_new')}
              </Button>
            </div>
          )}

          {/* My categories - grid view */}
          {ownedPerimeters.length > 0 && (
            <div className="mb-8">
              <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
                {t('cat_expenses')}
              </p>
              <CategoryGrid perimeters={ownedPerimeters} onEdit={setEditingPerimeter} />
            </div>
          )}

          {/* Shared categories */}
          {sharedPerimeters.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
                Shared with me
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {sharedPerimeters.map(perimeter => (
                  <PerimeterCard
                    key={perimeter.id}
                    perimeter={perimeter}
                    onEdit={setEditingPerimeter}
                    onDelete={handleDelete}
                    onShare={setSharingPerimeter}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </PageFadeIn>

      <FloatingActionButton onClick={() => setShowForm(true)} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cat_new')}</DialogTitle>
          </DialogHeader>
          <PerimeterForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPerimeter} onOpenChange={open => !open && setEditingPerimeter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cat_title')}</DialogTitle>
          </DialogHeader>
          {editingPerimeter && (
            <PerimeterForm
              onSubmit={handleUpdate}
              onCancel={() => setEditingPerimeter(null)}
              initialData={editingPerimeter}
            />
          )}
        </DialogContent>
      </Dialog>

      <ShareDialog
        perimeter={sharingPerimeter}
        open={!!sharingPerimeter}
        onOpenChange={open => !open && setSharingPerimeter(null)}
      />
    </ResponsiveContainer>
  );
}
