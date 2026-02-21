import type { Meta, StoryObj } from '@storybook/react';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastProvider,
  ToastViewport,
} from './toast';

const meta: Meta = {
  title: 'UI/Toast',
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Toast open>
      <div className="grid gap-1">
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>Something happened in the app.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};

export const Success: Story = {
  render: () => (
    <Toast open variant="success">
      <div className="grid gap-1">
        <ToastTitle>Expense saved</ToastTitle>
        <ToastDescription>Your expense has been recorded successfully.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};

export const Error: Story = {
  render: () => (
    <Toast open variant="error">
      <div className="grid gap-1">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>Failed to save. Please try again.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};

export const Warning: Story = {
  render: () => (
    <Toast open variant="warning">
      <div className="grid gap-1">
        <ToastTitle>Budget warning</ToastTitle>
        <ToastDescription>You have used 90% of your food budget.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Toast open>
      <div className="grid gap-1">
        <ToastTitle>Expense deleted</ToastTitle>
        <ToastDescription>The expense was removed.</ToastDescription>
      </div>
      <ToastAction altText="Undo deletion">Undo</ToastAction>
      <ToastClose />
    </Toast>
  ),
};
