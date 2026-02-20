import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label>Email</Label>
      <Input type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Number: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label>Amount *</Label>
      <Input type="number" step="0.01" min="0.01" placeholder="0.00" />
    </div>
  ),
};

export const Date: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label>Date</Label>
      <Input type="date" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { placeholder: 'Disabled input', disabled: true },
};
