import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './empty-state';
import { Receipt, Wallet, Search, FolderOpen } from 'lucide-react';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoExpenses: Story = {
  args: {
    icon: Receipt,
    title: 'No expenses yet',
    description: 'Start tracking your spending by adding your first expense.',
    actionLabel: 'Add Expense',
    onAction: () => alert('Add expense clicked'),
    iconColor: 'text-red-400',
  },
};

export const NoIncome: Story = {
  args: {
    icon: Wallet,
    title: 'No income recorded',
    description: 'Add your income sources to see the full financial picture.',
    actionLabel: 'Add Income',
    onAction: () => alert('Add income clicked'),
    iconColor: 'text-emerald-400',
  },
};

export const NoResults: Story = {
  args: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you need.',
  },
};

export const NoCategories: Story = {
  args: {
    icon: FolderOpen,
    title: 'No categories',
    description: 'Create categories to organize your expenses.',
    actionLabel: 'Create Category',
    onAction: () => alert('Create category clicked'),
    iconColor: 'text-amber-500',
  },
};
