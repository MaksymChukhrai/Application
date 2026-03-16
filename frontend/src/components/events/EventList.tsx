import type { Event } from "../../types";
import { EventCard } from "./EventCard";
import { EventCardSkeleton } from "../common/Skeleton";

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  isTagFiltered?: boolean;          // ← Stage #2
}

export const EventList = ({
  events,
  isLoading,
  isTagFiltered = false,            // ← Stage #2
}: EventListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        {/* ── Stage #2: разный empty state ─────────── */}
        {isTagFiltered ? (
          <>
            <p className="text-gray-400 text-lg font-medium">
              No events match the selected tags.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try selecting different tags or clear the filter
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-400 text-lg font-medium">No events found</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back later or create your own event
            </p>
          </>
        )}
        {/* ─────────────────────────────────────────── */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};