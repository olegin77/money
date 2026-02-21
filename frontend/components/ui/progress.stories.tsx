import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 60 },
};

export const Empty: Story = {
  args: { value: 0 },
};

export const Full: Story = {
  args: { value: 100 },
};

export const Success: Story = {
  args: { value: 75, variant: 'success' },
};

export const Warning: Story = {
  args: { value: 85, variant: 'warning' },
};

export const Danger: Story = {
  args: { value: 95, variant: 'danger' },
};

export const BudgetUsage: Story = {
  render: () => (
    <div className="w-64 space-y-3">
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span>Food &amp; Dining</span>
          <span>$340 / $500</span>
        </div>
        <Progress value={68} variant="default" />
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span>Transport</span>
          <span>$180 / $200</span>
        </div>
        <Progress value={90} variant="warning" />
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span>Entertainment</span>
          <span>$290 / $250</span>
        </div>
        <Progress value={116} max={100} variant="danger" />
      </div>
    </div>
  ),
};
