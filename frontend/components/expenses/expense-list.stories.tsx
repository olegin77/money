import type { Meta, StoryObj } from '@storybook/react';
import { ExpenseList } from './expense-list';

const meta: Meta<typeof ExpenseList> = {
  title: 'Expenses/ExpenseList',
  component: ExpenseList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExpenseList>;

const MOCK_EXPENSES = [
  {
    id: '1',
    amount: 45.99,
    currency: 'USD',
    description: 'Groceries at Whole Foods',
    date: '2026-02-20',
    categoryId: 'cat-1',
    paymentMethod: 'Credit Card',
    location: 'Downtown',
    tags: [],
    isRecurring: false,
    recurrenceRule: undefined,
    attachments: [],
    userId: 'user-1',
    createdAt: new Date('2026-02-20T10:00:00Z'),
    updatedAt: new Date('2026-02-20T10:00:00Z'),
  },
  {
    id: '2',
    amount: 1500,
    currency: 'USD',
    description: 'Monthly Rent',
    date: '2026-02-01',
    categoryId: 'cat-2',
    paymentMethod: 'Bank Transfer',
    location: undefined,
    tags: [],
    isRecurring: true,
    recurrenceRule: JSON.stringify({ period: 'monthly', day: 1 }),
    attachments: [],
    userId: 'user-1',
    createdAt: new Date('2026-02-01T08:00:00Z'),
    updatedAt: new Date('2026-02-01T08:00:00Z'),
  },
  {
    id: '3',
    amount: 5.5,
    currency: 'EUR',
    description: 'Coffee',
    date: '2026-02-19',
    categoryId: 'cat-3',
    paymentMethod: 'Cash',
    location: 'Cafe Central',
    tags: [],
    isRecurring: false,
    recurrenceRule: undefined,
    attachments: [],
    userId: 'user-1',
    createdAt: new Date('2026-02-19T14:30:00Z'),
    updatedAt: new Date('2026-02-19T14:30:00Z'),
  },
];

export const WithItems: Story = {
  args: {
    expenses: MOCK_EXPENSES as never[],
    onEdit: expense => alert(`Edit: ${expense.description}`),
    onDelete: id => alert(`Delete: ${id}`),
  },
};

export const Empty: Story = {
  args: {
    expenses: [],
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const SingleItem: Story = {
  args: {
    expenses: [MOCK_EXPENSES[0]] as never[],
    onEdit: expense => alert(`Edit: ${expense.description}`),
    onDelete: id => alert(`Delete: ${id}`),
  },
};
