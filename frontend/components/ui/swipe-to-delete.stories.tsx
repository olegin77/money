import type { Meta, StoryObj } from '@storybook/react';
import { SwipeToDelete } from './swipe-to-delete';
import { Card } from './card';

const meta: Meta<typeof SwipeToDelete> = {
  title: 'UI/SwipeToDelete',
  component: SwipeToDelete,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SwipeToDelete>;

export const Default: Story = {
  render: () => (
    <div className="mx-auto max-w-sm">
      <SwipeToDelete onDelete={() => alert('Item deleted!')}>
        <Card className="px-5 py-4">
          <p className="text-sm font-medium">Swipe left to delete this card</p>
          <p className="text-xs text-zinc-500">Try dragging this item to the left</p>
        </Card>
      </SwipeToDelete>
    </div>
  ),
};

export const ListItems: Story = {
  render: () => (
    <div className="mx-auto max-w-sm space-y-2">
      {['Groceries — $45.00', 'Coffee — $5.50', 'Transport — $12.00'].map((item, i) => (
        <SwipeToDelete key={i} onDelete={() => alert(`Deleted: ${item}`)}>
          <Card className="px-5 py-3">
            <p className="text-sm">{item}</p>
          </Card>
        </SwipeToDelete>
      ))}
    </div>
  ),
};
