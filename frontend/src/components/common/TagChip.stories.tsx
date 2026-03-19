import type { Meta, StoryObj } from '@storybook/react-vite';
import TagChip from './TagChip';
import type { Tag } from '../../types';

const meta: Meta<typeof TagChip> = {
  title: 'Common/TagChip',
  component: TagChip,
  tags: ['autodocs'],
  argTypes: {
    tag: { control: 'object' },
  },
};

export default meta;
type Story = StoryObj<typeof TagChip>;

export const Tech: Story = {
  args: {
    tag: { id: '1', name: 'tech' } satisfies Tag,
  },
};

export const Art: Story = {
  args: {
    tag: { id: '2', name: 'art' } satisfies Tag,
  },
};

export const AllTags: Story = {
  render: () => {
    const tags: Tag[] = [
      { id: '1', name: 'tech' },
      { id: '2', name: 'art' },
      { id: '3', name: 'business' },
      { id: '4', name: 'music' },
      { id: '5', name: 'design' },
      { id: '6', name: 'networking' },
      { id: '7', name: 'blockchain' },
    ];
    return (
      <div className="flex flex-wrap gap-2 p-4">
        {tags.map((tag) => (
          <TagChip key={tag.id} tag={tag} />
        ))}
      </div>
    );
  },
};

export const DeterministicColors: Story = {
  render: () => {
    // Same tag name always same color — verify determinism
    const tag: Tag = { id: '1', name: 'tech' };
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm text-gray-500">
          Same tag rendered 3 times — always same color:
        </p>
        <div className="flex gap-2">
          <TagChip tag={tag} />
          <TagChip tag={tag} />
          <TagChip tag={tag} />
        </div>
      </div>
    );
  },
};