import type { Meta, StoryObj } from '@storybook/react';
import { FloatingActionButton } from './floating-action-button';
import { Plus, PenLine, Camera } from 'lucide-react';

const meta: Meta<typeof FloatingActionButton> = {
  title: 'UI/FloatingActionButton',
  component: FloatingActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof FloatingActionButton>;

export const Default: Story = {
  args: {
    onClick: () => alert('FAB clicked'),
  },
};

export const CustomIcon: Story = {
  args: {
    onClick: () => alert('FAB clicked'),
    icon: <PenLine size={22} />,
  },
};

export const WithCamera: Story = {
  args: {
    onClick: () => alert('Camera FAB clicked'),
    icon: <Camera size={22} />,
  },
};

export const InContext: Story = {
  render: () => (
    <div className="relative h-96 w-full bg-zinc-50 p-6 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">
        The FAB is fixed at the bottom-right corner (visible on mobile viewports).
      </p>
      <FloatingActionButton onClick={() => alert('Add new')} icon={<Plus size={22} />} />
    </div>
  ),
};
