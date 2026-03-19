import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton, EventCardSkeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Common/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    className: 'h-4 w-48',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  ),
};

export const EventCard: Story = {
  render: () => (
    <div className="max-w-sm p-4">
      <EventCardSkeleton />
    </div>
  ),
};

export const EventCardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
    </div>
  ),
};