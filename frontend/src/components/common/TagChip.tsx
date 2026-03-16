import type { Tag } from "../../types";

// Color palette — cycles through 8 colors by tag index or name hash
const TAG_COLORS: string[] = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-red-100 text-red-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
];

// Deterministic color by tag name — same tag always same color
function getTagColor(name: string): string {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

interface TagChipProps {
  tag: Tag;
  className?: string;
}

export default function TagChip({ tag, className = "" }: TagChipProps) {
  const colorClass = getTagColor(tag.name);

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        rounded-full text-xs font-medium
        capitalize whitespace-nowrap
        ${colorClass}
        ${className}
      `}
    >
      {tag.name}
    </span>
  );
}