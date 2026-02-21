import type { Meta, StoryObj } from '@storybook/react';
import {
  PageFadeIn,
  StaggerContainer,
  StaggerItem,
  PageTransition,
  AnimatedList,
  AnimatedListItem,
  HoverCard,
} from './motion';
import { Card } from './card';

const meta: Meta = {
  title: 'UI/Motion',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const FadeIn: Story = {
  render: () => (
    <PageFadeIn>
      <Card className="p-6">
        <p className="text-sm">This card fades in with a subtle upward motion.</p>
      </Card>
    </PageFadeIn>
  ),
};

export const Stagger: Story = {
  render: () => (
    <StaggerContainer className="space-y-3">
      {['First item', 'Second item', 'Third item', 'Fourth item'].map((text, i) => (
        <StaggerItem key={i}>
          <Card className="px-5 py-3">
            <p className="text-sm">{text}</p>
          </Card>
        </StaggerItem>
      ))}
    </StaggerContainer>
  ),
};

export const PageTransitionDemo: Story = {
  render: () => (
    <PageTransition pageKey="demo-page">
      <Card className="p-6">
        <p className="text-sm">Page transition with enter/exit animations.</p>
      </Card>
    </PageTransition>
  ),
};

export const AnimatedListDemo: Story = {
  render: () => (
    <AnimatedList className="space-y-2">
      {['Apple', 'Banana', 'Cherry'].map((fruit, i) => (
        <AnimatedListItem key={fruit} layoutId={fruit}>
          <Card className="px-5 py-3">
            <p className="text-sm">
              {i + 1}. {fruit}
            </p>
          </Card>
        </AnimatedListItem>
      ))}
    </AnimatedList>
  ),
};

export const HoverCardDemo: Story = {
  render: () => (
    <div className="flex gap-4">
      {['Card A', 'Card B', 'Card C'].map(label => (
        <HoverCard key={label}>
          <Card className="w-32 p-4 text-center">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-zinc-400">Hover me</p>
          </Card>
        </HoverCard>
      ))}
    </div>
  ),
};
