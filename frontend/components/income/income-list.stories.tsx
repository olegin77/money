import type { Meta, StoryObj } from '@storybook/react';
import { IncomeList } from './income-list';

const meta: Meta<typeof IncomeList> = {
  title: 'Income/IncomeList',
  component: IncomeList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IncomeList>;

const MOCK_INCOMES = [
  {
    id: '1',
    amount: 5000,
    currency: 'USD',
    description: 'Monthly Salary',
    source: 'Employer Inc.',
    date: '2026-02-01',
    tags: [],
    isRecurring: true,
    recurrenceRule: JSON.stringify({ period: 'monthly', day: 1 }),
    userId: 'user-1',
    createdAt: new Date('2026-02-01T08:00:00Z'),
    updatedAt: new Date('2026-02-01T08:00:00Z'),
  },
  {
    id: '2',
    amount: 1200,
    currency: 'USD',
    description: 'Freelance project',
    source: 'Client Corp',
    date: '2026-02-10',
    tags: [],
    isRecurring: false,
    recurrenceRule: undefined,
    userId: 'user-1',
    createdAt: new Date('2026-02-10T12:00:00Z'),
    updatedAt: new Date('2026-02-10T12:00:00Z'),
  },
  {
    id: '3',
    amount: 250,
    currency: 'EUR',
    description: 'Dividend payment',
    source: 'Brokerage',
    date: '2026-02-15',
    tags: [],
    isRecurring: false,
    recurrenceRule: undefined,
    userId: 'user-1',
    createdAt: new Date('2026-02-15T09:00:00Z'),
    updatedAt: new Date('2026-02-15T09:00:00Z'),
  },
];

export const WithItems: Story = {
  args: {
    incomes: MOCK_INCOMES as never[],
    onEdit: income => alert(`Edit: ${income.description}`),
    onDelete: id => alert(`Delete: ${id}`),
  },
};

export const Empty: Story = {
  args: {
    incomes: [],
    onEdit: () => {},
    onDelete: () => {},
  },
};

export const SingleItem: Story = {
  args: {
    incomes: [MOCK_INCOMES[0]] as never[],
    onEdit: income => alert(`Edit: ${income.description}`),
    onDelete: id => alert(`Delete: ${id}`),
  },
};
