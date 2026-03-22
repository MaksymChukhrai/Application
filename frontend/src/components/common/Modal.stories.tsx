import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Common/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    isOpen:            { control: 'boolean' },
    isDangerous:       { control: 'boolean' },
    isConfirmLoading:  { control: 'boolean' },
    title:             { control: 'text' },
    confirmLabel:      { control: 'text' },
    cancelLabel:       { control: 'text' },
    onConfirm:         { action: 'confirmed' },
    onClose:           { action: 'closed' },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Static open state for docs
export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Confirm Action',
    children: 'Are you sure you want to proceed with this action?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDangerous: false,
    isConfirmLoading: false,
  },
};

export const Dangerous: Story = {
  args: {
    isOpen: true,
    title: 'Delete Event',
    children: 'This action cannot be undone. The event and all its data will be permanently deleted.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    isDangerous: true,
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    title: 'Saving Changes',
    children: 'Please wait while we save your changes...',
    confirmLabel: 'Save',
    isConfirmLoading: true,
  },
};

// Interactive story with real open/close
export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="p-8">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open Modal
        </Button>
        <Modal
          isOpen={isOpen}
          title="Confirm Leave Event"
          confirmLabel="Leave"
          cancelLabel="Stay"
          isDangerous={false}
          onConfirm={() => setIsOpen(false)}
          onClose={() => setIsOpen(false)}
        >
          Are you sure you want to leave this event?
          You can always rejoin later.
        </Modal>
      </div>
    );
  },
};

export const InteractiveDangerous: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="p-8">
        <Button variant="danger" onClick={() => setIsOpen(true)}>
          Delete Event
        </Button>
        <Modal
          isOpen={isOpen}
          title="Delete Event"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isDangerous={true}
          onConfirm={() => setIsOpen(false)}
          onClose={() => setIsOpen(false)}
        >
          This action cannot be undone. All participants will be notified.
        </Modal>
      </div>
    );
  },
};