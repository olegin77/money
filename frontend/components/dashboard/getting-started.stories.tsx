import type { Meta, StoryObj } from '@storybook/react';
import { GettingStarted } from './getting-started';

const meta: Meta<typeof GettingStarted> = {
  title: 'Dashboard/GettingStarted',
  component: GettingStarted,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GettingStarted>;

export const NothingDone: Story = {
  args: {
    hasCategories: false,
    hasExpenses: false,
    hasIncome: false,
    hasFriends: false,
  },
};

export const PartiallyComplete: Story = {
  args: {
    hasCategories: true,
    hasExpenses: true,
    hasIncome: false,
    hasFriends: false,
  },
};

export const AlmostDone: Story = {
  args: {
    hasCategories: true,
    hasExpenses: true,
    hasIncome: true,
    hasFriends: false,
  },
};

export const AllComplete: Story = {
  args: {
    hasCategories: true,
    hasExpenses: true,
    hasIncome: true,
    hasFriends: true,
  },
};
