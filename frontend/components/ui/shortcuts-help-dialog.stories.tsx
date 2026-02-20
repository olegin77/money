import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ShortcutsHelpDialog } from './shortcuts-help-dialog';
import { Button } from './button';

const meta: Meta<typeof ShortcutsHelpDialog> = {
  title: 'UI/ShortcutsHelpDialog',
  component: ShortcutsHelpDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ShortcutsHelpDialog>;

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Show shortcuts</Button>
          <ShortcutsHelpDialog open={open} onOpenChange={setOpen} />
        </>
      );
    };
    return <Wrapper />;
  },
};
