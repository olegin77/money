'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatePerimeterData } from '@/lib/api/perimeters';

interface PerimeterFormProps {
  onSubmit: (data: CreatePerimeterData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreatePerimeterData>;
}

const COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
  '#8B5CF6',
  '#14B8A6',
];

const ICONS = ['💰', '🏠', '🚗', '🍔', '🎮', '👕', '💊', '✈️', '📱', '🎓'];

export function PerimeterForm({ onSubmit, onCancel, initialData }: PerimeterFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePerimeterData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    icon: initialData?.icon || '💰',
    color: initialData?.color || '#6366F1',
    budget: initialData?.budget || undefined,
    budgetPeriod: initialData?.budgetPeriod || 'monthly',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreatePerimeterData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Food & Dining"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          required
          disabled={loading}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          placeholder="Brief description of this category"
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          disabled={loading}
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="grid grid-cols-5 gap-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => handleChange('icon', icon)}
                className={`rounded-lg p-2 text-2xl transition-all ${
                  formData.icon === icon
                    ? 'ring-primary bg-primary/10 ring-2'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                disabled={loading}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('color', color)}
                className={`h-10 rounded-lg transition-all ${
                  formData.color === color ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: color }}
                disabled={loading}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="glass space-y-4 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableBudget"
            checked={formData.budget !== undefined}
            onChange={e => handleChange('budget', e.target.checked ? 0 : undefined)}
            className="rounded"
          />
          <Label htmlFor="enableBudget" className="cursor-pointer">
            Enable Budget Tracking
          </Label>
        </div>

        {formData.budget !== undefined && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Amount</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.budget || ''}
                onChange={e => handleChange('budget', parseFloat(e.target.value))}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetPeriod">Period</Label>
              <select
                id="budgetPeriod"
                value={formData.budgetPeriod}
                onChange={e => handleChange('budgetPeriod', e.target.value)}
                className="bg-background flex h-12 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm dark:border-gray-700"
                disabled={loading}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving...' : 'Save Category'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
