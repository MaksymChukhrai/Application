import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchEvents } from "../store/events.slice";
import { EventList } from "../components/events/EventList";

export const EventsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading, error } = useSelector(
    (state: RootState) => state.events,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const filtered = items.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Events</h1>
        <p className="text-gray-500 text-sm mt-1">
          Find and join exciting events happening around you
        </p>
      </div>

      {/* Search input with magnifier icon */}
      <div className="relative w-full max-w-sm">
        {/* Search icon */}
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <EventList events={filtered} isLoading={isLoading} />
    </div>
  );
};
