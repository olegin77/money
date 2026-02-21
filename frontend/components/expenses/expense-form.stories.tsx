import type { Meta, StoryObj } from '@storybook/react';
import { ExpenseForm } from './expense-form';

const meta: Meta<typeof ExpenseForm> = {
  title: 'Expenses/ExpenseForm',
  component: ExpenseForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ExpenseForm>;

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
      amount: 45.99,
      currency: 'USD',
      description: 'Groceries',
      date: '2026-02-21',
      paymentMethod: 'Credit Card',
      location: 'Whole Foods',
    },
  },
};

export const RecurringExpense: Story = {
  args: {
    onSubmit: noop,
    onCancel: () => alert('Cancelled'),
    initialData: {
      amount: 1500,
      currency: 'USD',
      description: 'Rent',
      date: '2026-02-01',
      isRecurring: true,
      recurrenceRule: JSON.stringify({ period: 'monthly', day: 1 }),
    },
  },
};
