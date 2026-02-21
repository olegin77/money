import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from './sheet';
import { Button } from './button';

const meta: Meta<typeof Sheet> = {
  title: 'UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

function SheetDemo({ side = 'bottom' }: { side?: 'left' | 'right' | 'top' | 'bottom' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-64 items-center justify-center">
      <Button onClick={() => setOpen(true)}>Open {side} sheet</Button>
      <Sheet open={open} onOpenChange={setOpen} side={side}>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a description of the sheet content.</SheetDescription>
        </SheetHeader>
        <div className="space-y-3">
          <p className="text-sm">
            Sheet content goes here. This component is mobile-only (md:hidden).
          </p>
          <Button onClick={() => setOpen(false)} variant="outline">
            Close
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

export const Bottom: Story = {
  render: () => <SheetDemo side="bottom" />,
};

export const Right: Story = {
  render: () => <SheetDemo side="right" />,
};

export const Left: Story = {
  render: () => <SheetDemo side="left" />,
};

export const Top: Story = {
  render: () => <SheetDemo side="top" />,
};
