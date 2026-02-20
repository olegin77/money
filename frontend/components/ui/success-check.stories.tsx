import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SuccessCheck } from './success-check';
import { Button } from './button';

const meta: Meta<typeof SuccessCheck> = {
  title: 'UI/SuccessCheck',
  component: SuccessCheck,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SuccessCheck>;

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [show, setShow] = useState(false);
      return (
        <>
          <Button onClick={() => setShow(true)}>Trigger success</Button>
          <SuccessCheck show={show} onDone={() => setShow(false)} />
        </>
      );
    };
    return <Wrapper />;
  },
};
