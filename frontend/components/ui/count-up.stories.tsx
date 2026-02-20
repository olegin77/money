import type { Meta, StoryObj } from '@storybook/react';
import { CountUp } from './count-up';

const meta: Meta<typeof CountUp> = {
  title: 'UI/CountUp',
  component: CountUp,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CountUp>;

export const Currency: Story = {
  args: { end: 1234.56, prefix: '$', duration: 1500 },
};

export const Percentage: Story = {
  args: { end: 87.3, suffix: '%', decimals: 1, duration: 1000 },
};

export const NegativeValue: Story = {
  args: { end: -420.0, prefix: '$', duration: 1200 },
};
