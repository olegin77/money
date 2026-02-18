'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PerimeterForm } from '@/components/perimeters/perimeter-form';
import { PerimeterCard } from '@/components/perimeters/perimeter-card';
import { ShareDialog } from '@/components/perimeters/share-dialog';
import { ResponsiveContainer } from '@/components/layout/responsive-container';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Skeleton } from '@/components/ui/skeleton';
import { perimetersApi, Perimeter, CreatePerimeterData } from '@/lib/api/perimeters';

export default function CategoriesPage() {
  const { isLoading: authLoading } = useAuth(true);
  const [perimeters, setPerimeters] = useState<Perimeter[]>([]);
  const [_loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerimeter, setEditingPerimeter] = useState<Perimeter | null>(null);
  const [sharingPerimeter, setSharingPerimeter] = useState<Perimeter | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadPerimeters();
    }
  }, [authLoading]);

  const loadPerimeters = async () => {
    try {
      setLoading(true);
      const data = await perimetersApi.findAll();
      setPerimeters(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreatePerimeterData) => {
    try {
      await perimetersApi.create(data);
      setShowForm(false);
      loadPerimeters();
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  const handleUpdate = async (data: CreatePerimeterData) => {
    if (!editingPerimeter) return;

    try {
      await perimetersApi.update(editingPerimeter.id, data);
      setEditingPerimeter(null);
      loadPerimeters();
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await perimetersApi.delete(id);
      loadPerimeters();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  if (authLoading) {
    return (
      <ResponsiveContainer>
        <div className="min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-6xl space-y-4">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  const ownedPerimeters = perimeters.filter(p => !p.sharedRole);
  const sharedPerimeters = perimeters.filter(p => p.sharedRole);

  return (
    <ResponsiveContainer>
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 hidden items-center justify-between md:flex">
            <div>
              <h1 className="font-satoshi mb-2 text-4xl font-bold">Categories</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Organize your expenses with budgets
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>+ New Category</Button>
          </div>

          {/* Owned Categories */}
          {ownedPerimeters.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold">My Categories</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {ownedPerimeters.map(perimeter => (
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

          {/* Shared Categories */}
          {sharedPerimeters.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-bold">Shared with Me</h2>
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

          {/* Empty State */}
          {perimeters.length === 0 && (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="mb-4 text-5xl">📁</div>
              <p className="mb-2 text-xl font-semibold">No categories yet</p>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Create your first category to organize expenses with budgets
              </p>
              <Button onClick={() => setShowForm(true)}>Create Category</Button>
            </div>
          )}

          {/* Create Dialog */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Category</DialogTitle>
              </DialogHeader>
              <PerimeterForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog
            open={!!editingPerimeter}
            onOpenChange={open => !open && setEditingPerimeter(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
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

          {/* Share Dialog */}
          <ShareDialog
            perimeter={sharingPerimeter}
            open={!!sharingPerimeter}
            onOpenChange={open => !open && setSharingPerimeter(null)}
          />
        </div>
      </div>
      <FloatingActionButton onClick={() => setShowForm(true)} />
    </ResponsiveContainer>
  );
}
