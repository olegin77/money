import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Card content goes here.</p>
      </CardContent>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm">Content without a header.</p>
      </CardContent>
    </Card>
  ),
};

export const StatsCard: Story = {
  render: () => (
    <Card>
      <CardContent className="pt-5">
        <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
          Total expenses
        </p>
        <p className="text-3xl font-bold tabular-nums text-red-500">$1,234.56</p>
        <p className="text-muted-foreground mt-1.5 text-xs">12 transactions</p>
      </CardContent>
    </Card>
  ),
};
