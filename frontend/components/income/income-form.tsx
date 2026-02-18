'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateIncomeData } from '@/lib/api/income';

interface IncomeFormProps {
  onSubmit: (data: CreateIncomeData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateIncomeData>;
}

export function IncomeForm({ onSubmit, onCancel, initialData }: IncomeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateIncomeData>({
    amount: initialData?.amount || 0,
    currency: initialData?.currency || 'USD',
    description: initialData?.description || '',
    source: initialData?.source || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    tags: initialData?.tags || [],
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

  const handleChange = (field: keyof CreateIncomeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.amount || ''}
            onChange={e => handleChange('amount', parseFloat(e.target.value))}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            type="text"
            placeholder="USD"
            maxLength={3}
            value={formData.currency}
            onChange={e => handleChange('currency', e.target.value.toUpperCase())}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          type="text"
          placeholder="Monthly salary, freelance work, etc."
          maxLength={500}
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          type="text"
          placeholder="Company name, client, etc."
          maxLength={100}
          value={formData.source}
          onChange={e => handleChange('source', e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={e => handleChange('date', e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving...' : 'Save Income'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
