import type { Meta, StoryObj } from '@storybook/react';
import { IncomeForm } from './income-form';

const meta: Meta<typeof IncomeForm> = {
  title: 'Income/IncomeForm',
  component: IncomeForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof IncomeForm>;

const noop = async () => {
  await new Promise(r => setTimeout(r, 1000));
};

export const Empty: Story = {
  args: {
    onSubmit: noop,
    onCancel: () => alert('Cancelled'),
  },
};

export const WithInitialData: Story = {
  args: {
    onSubmit: noop,
    onCancel: () => alert('Cancelled'),
    initialData: {
      amount: 5000,
      currency: 'USD',
      description: 'Salary',
      source: 'Employer Inc.',
      date: '2026-02-15',
    },
  },
};

export const RecurringIncome: Story = {
  args: {
    onSubmit: noop,
    onCancel: () => alert('Cancelled'),
    initialData: {
      amount: 5000,
      currency: 'USD',
      description: 'Monthly Salary',
      source: 'Employer Inc.',
      date: '2026-02-01',
      isRecurring: true,
      recurrenceRule: JSON.stringify({ period: 'monthly', day: 1 }),
    },
  },
};
