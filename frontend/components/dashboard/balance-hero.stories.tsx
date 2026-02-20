import type { Meta, StoryObj } from '@storybook/react';
import { BalanceHero } from './balance-hero';

const meta: Meta<typeof BalanceHero> = {
  title: 'Dashboard/BalanceHero',
  component: BalanceHero,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BalanceHero>;

export const Positive: Story = {
  args: {
    balance: 12450.5,
    savingsRate: 23.4,
    currency: 'USD',
  },
};

export const Negative: Story = {
  args: {
    balance: -340.2,
    savingsRate: -5.1,
    currency: 'EUR',
  },
};

export const Zero: Story = {
  args: {
    balance: 0,
    currency: 'RUB',
  },
};

export const NoSavingsRate: Story = {
  args: {
    balance: 5000,
    currency: 'GBP',
  },
};
