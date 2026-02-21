import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: 'Email address' },
};

export const WithInput: Story = {
  render: () => (
    <div className="w-64 space-y-1.5">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="w-64 space-y-1.5">
      <Label htmlFor="amount">
        Amount <span className="text-red-500">*</span>
      </Label>
      <Input id="amount" type="number" placeholder="0.00" />
    </div>
  ),
};
