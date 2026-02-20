import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { NumPad } from './num-pad';

const meta: Meta<typeof NumPad> = {
  title: 'UI/NumPad',
  component: NumPad,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NumPad>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="mx-auto max-w-xs">
        <NumPad value={value} onChange={setValue} onSubmit={() => alert(`Amount: ${value}`)} />
      </div>
    );
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('42.50');
    return (
      <div className="mx-auto max-w-xs">
        <NumPad value={value} onChange={setValue} />
      </div>
    );
  },
};
