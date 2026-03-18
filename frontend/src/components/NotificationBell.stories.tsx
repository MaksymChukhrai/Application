// frontend/src/components/NotificationBell.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { NotificationBellUI } from './NotificationBell';
import type { Notification } from '../store/notificationsStore';

const meta: Meta<typeof NotificationBellUI> = {
  title: 'Common/NotificationBell',
  component: NotificationBellUI,
  tags: ['autodocs'],
  // No decorators — padding handled per-story via render wrapper
  argTypes: {
    onRemove:   { action: 'removed' },
    onClearAll: { action: 'cleared all' },
  },
};

export default meta;
type Story = StoryObj<typeof NotificationBellUI>;

// ─── Mock data ────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: '1',
    message: 'Bob Smith joined "Tech Conference 2026"',
    type: 'success',
    createdAt: new Date(Date.now() - 1000 * 60),
  },
  {
    id: '2',
    message: 'Alice Johnson left "Jazz Under the Stars"',
    type: 'warning',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '3',
    message: 'New event: "Web3 Hackathon" by Charlie Brown',
    type: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
];

// ─── Helper — wraps any story in padding so dropdown is visible ──

const withPadding = (args: React.ComponentProps<typeof NotificationBellUI>) => (
  <div className="p-8 flex justify-end">
    <NotificationBellUI {...args} />
  </div>
);

// ─── Stories ─────────────────────────────────────────────

export const Empty: Story = {
  render: (args) => withPadding(args),
  args: {
    notifications: [],
  },
};

export const WithBadge: Story = {
  render: (args) => withPadding(args),
  args: {
    notifications: mockNotifications,
  },
};

export const SingleSuccess: Story = {
  render: (args) => withPadding(args),
  args: {
    notifications: [mockNotifications[0]],
  },
};

export const SingleWarning: Story = {
  render: (args) => withPadding(args),
  args: {
    notifications: [mockNotifications[1]],
  },
};

export const SingleInfo: Story = {
  render: (args) => withPadding(args),
  args: {
    notifications: [mockNotifications[2]],
  },
};

export const ManyNotifications: Story = {
  render: (args) => withPadding(args),
  args: {
    notifications: Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      message: `Notification #${i + 1} — some event update`,
      type: (['success', 'warning', 'info'] as const)[i % 3],
      createdAt: new Date(Date.now() - 1000 * 60 * i),
    })),
  },
};

export const HighBadgeCount: Story = {
  render: (args) => withPadding(args),
  args: {
    notifications: Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      message: `Event update #${i + 1}`,
      type: 'info' as const,
      createdAt: new Date(),
    })),
  },
};