import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchEvents } from "../store/events.slice";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { EventList } from "../components/events/EventList";
import type { Event } from "../types";

export const EventsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useCurrentUser();
  const { items, isLoading, error } = useSelector(
    (state: RootState) => state.events,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const eventsWithJoined: Event[] = items.map((event) => ({
    ...event,
    isJoined: currentUser
      ? event.participants.some((p) => p.id === currentUser.id)
      : false,
  }));

  const filtered = eventsWithJoined.filter((event) =>
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

      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <EventList events={filtered} isLoading={isLoading} />
    </div>
  );
};
