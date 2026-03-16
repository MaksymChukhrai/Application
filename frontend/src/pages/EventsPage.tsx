import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchEvents, setActiveTagIds } from "../store/events.slice";
import { fetchTags } from "../store/tags.slice";
import { EventList } from "../components/events/EventList";

export const EventsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error, activeTagIds } = useSelector(
    (state: RootState) => state.events,
  );

  const { items: allTags } = useSelector((state: RootState) => state.tags);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchEvents(activeTagIds.length > 0 ? activeTagIds : undefined));
  }, [dispatch, activeTagIds]);

  const handleTagToggle = (tagId: string) => {
    const next = activeTagIds.includes(tagId)
      ? activeTagIds.filter((id) => id !== tagId)
      : [...activeTagIds, tagId];
    dispatch(setActiveTagIds(next));
  };

  const handleClearTags = () => {
    dispatch(setActiveTagIds([]));
  };

  // Client-side search filter (по title)
  const filtered = items.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase()),
  );

  const isTagFiltered = activeTagIds.length > 0; // ← Stage #2

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Events</h1>
        <p className="text-gray-500 text-sm mt-1">
          Find and join exciting events happening around you
        </p>
      </div>

      {/* Search + Tag filter row */}
      <div className="flex flex-col gap-3">
        {/* Search input */}
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* ── Stage #2: Tag filter ─────────────────── */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">
              Filter by tag:
            </span>
            {allTags.map((tag) => {
              const isActive = activeTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`
                    inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                    capitalize transition-all duration-150 cursor-pointer
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  {tag.name}
                </button>
              );
            })}
            {isTagFiltered && (
              <button
                onClick={handleClearTags}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline ml-1"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        {/* ─────────────────────────────────────────── */}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <EventList
        events={filtered}
        isLoading={isLoading}
        isTagFiltered={isTagFiltered}
      />
    </div>
  );
};
