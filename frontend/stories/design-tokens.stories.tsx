import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Tokens',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const COLORS = [
  { name: 'Indigo 600', css: 'bg-indigo-600', hex: '#4f46e5' },
  { name: 'Indigo 500', css: 'bg-indigo-500', hex: '#6366f1' },
  { name: 'Violet 500', css: 'bg-violet-500', hex: '#8b5cf6' },
  { name: 'Red 500', css: 'bg-red-500', hex: '#ef4444' },
  { name: 'Emerald 500', css: 'bg-emerald-500', hex: '#10b981' },
  { name: 'Amber 500', css: 'bg-amber-500', hex: '#f59e0b' },
  { name: 'Zinc 100', css: 'bg-zinc-100', hex: '#f4f4f5' },
  { name: 'Zinc 800', css: 'bg-zinc-800', hex: '#27272a' },
  { name: 'Zinc 900', css: 'bg-zinc-900', hex: '#18181b' },
];

const TYPOGRAPHY = [
  { label: 'Heading XL', className: 'text-4xl font-bold', text: 'Heading XL' },
  { label: 'Heading LG', className: 'text-2xl font-bold', text: 'Heading LG' },
  { label: 'Heading MD', className: 'text-lg font-semibold', text: 'Heading MD' },
  { label: 'Body', className: 'text-sm', text: 'Body text for regular content.' },
  { label: 'Caption', className: 'text-xs text-muted-foreground', text: 'Caption text' },
  {
    label: 'Tabular Nums',
    className: 'text-3xl font-bold tabular-nums',
    text: '$12,345.67',
  },
];

const SPACING = [4, 8, 12, 16, 20, 24, 32, 48, 64];

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
      {COLORS.map(color => (
        <div key={color.name} className="text-center">
          <div className={`${color.css} mx-auto h-16 w-16 rounded-xl shadow`} />
          <p className="mt-2 text-xs font-medium">{color.name}</p>
          <p className="text-xs text-zinc-400">{color.hex}</p>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="space-y-4">
      {TYPOGRAPHY.map(item => (
        <div key={item.label} className="flex items-baseline gap-4">
          <span className="w-28 shrink-0 text-xs text-zinc-400">{item.label}</span>
          <span className={item.className}>{item.text}</span>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-2">
      {SPACING.map(size => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-12 text-right text-xs text-zinc-400">{size}px</span>
          <div className="h-4 rounded bg-indigo-500" style={{ width: size }} />
        </div>
      ))}
    </div>
  ),
};

export const Radii: Story = {
  render: () => (
    <div className="flex gap-4">
      {[
        { label: 'rounded-md', cls: 'rounded-md' },
        { label: 'rounded-lg', cls: 'rounded-lg' },
        { label: 'rounded-xl', cls: 'rounded-xl' },
        { label: 'rounded-2xl', cls: 'rounded-2xl' },
        { label: 'rounded-full', cls: 'rounded-full' },
      ].map(item => (
        <div key={item.label} className="text-center">
          <div className={`${item.cls} h-16 w-16 bg-indigo-500`} />
          <p className="mt-2 text-xs text-zinc-400">{item.label}</p>
        </div>
      ))}
    </div>
  ),
};
