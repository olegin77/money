'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PerimeterForm } from '@/components/perimeters/perimeter-form';
import { PerimeterCard } from '@/components/perimeters/perimeter-card';
import { ShareDialog } from '@/components/perimeters/share-dialog';
import { perimetersApi, Perimeter, CreatePerimeterData } from '@/lib/api/perimeters';

export default function CategoriesPage() {
  const { isLoading: authLoading } = useAuth(true);
  const [perimeters, setPerimeters] = useState<Perimeter[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const ownedPerimeters = perimeters.filter((p) => !p.sharedRole);
  const sharedPerimeters = perimeters.filter((p) => p.sharedRole);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Categories</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organize your expenses with budgets
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>+ New Category</Button>
        </div>

        {/* Owned Categories */}
        {ownedPerimeters.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">My Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownedPerimeters.map((perimeter) => (
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
            <h2 className="text-xl font-bold mb-4">Shared with Me</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedPerimeters.map((perimeter) => (
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
            <div className="text-5xl mb-4">📁</div>
            <p className="text-xl font-semibold mb-2">No categories yet</p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
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
          onOpenChange={(open) => !open && setEditingPerimeter(null)}
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
          onOpenChange={(open) => !open && setSharingPerimeter(null)}
        />
      </div>
    </div>
  );
}
