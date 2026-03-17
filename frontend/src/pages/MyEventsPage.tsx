import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { Event } from "../types";
import type { CalendarView } from "../types";
import { usersApi } from "../api/users.api";
import { Button } from "../components/common/Button";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// ── Stage #2: tag → hex color ──────────────────────────
const TAG_CALENDAR_COLORS: Record<string, string> = {
  tech: "#6366f1",
  art: "#a855f7",
  business: "#3b82f6",
  music: "#ec4899",
  design: "#14b8a6",
  networking: "#f59e0b",
  blockchain: "#10b981",
};

const DEFAULT_BG = "#6366f1";

function getEventBg(event: Event): string {
  const firstTag = event.tags?.[0];
  if (!firstTag) return DEFAULT_BG;
  return TAG_CALENDAR_COLORS[firstTag.name.toLowerCase()] ?? DEFAULT_BG;
}

// Legend items — Tailwind bg class + name
const TAG_LEGEND: Array<{ name: string; colorClass: string }> = [
  { name: "tech", colorClass: "bg-indigo-500" },
  { name: "art", colorClass: "bg-purple-500" },
  { name: "business", colorClass: "bg-blue-500" },
  { name: "music", colorClass: "bg-pink-500" },
  { name: "design", colorClass: "bg-teal-500" },
  { name: "networking", colorClass: "bg-amber-500" },
  { name: "blockchain", colorClass: "bg-emerald-500" },
  { name: "other", colorClass: "bg-indigo-500" },
];
// ──────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  bg: string;
}

export const MyEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchMyEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await usersApi.getMyEvents();
        setEvents(data);
      } catch {
        setError("Failed to load your events");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  const calendarEvents: CalendarEvent[] = events.map((event) => {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      id: event.id,
      title: event.title,
      start,
      end,
      bg: getEventBg(event),
    };
  });

  const handleSelectEvent = (calEvent: CalendarEvent) => {
    navigate(`/events/${calEvent.id}`);
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const formatHeaderDate = () => {
    return format(currentDate, "MMMM yyyy");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage your event calendar
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/events/create")}
        >
          + Create Event
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {events.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-500 text-base">
            You are not part of any events yet. Explore public events and join.
          </p>
          <Link
            to="/events"
            className="mt-4 text-indigo-600 hover:underline text-sm font-medium"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          {/* ── Stage #2: Tag color legend ─────────────── */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {TAG_LEGEND.map(({ name, colorClass }) => (
              <div key={name} className="flex items-center gap-1.5">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${colorClass}`}
                ></span>
                <span className="text-xs text-gray-500 capitalize">{name}</span>
              </div>
            ))}
          </div>
          {/* ─────────────────────────────────────────── */}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const prev = new Date(currentDate);
                  if (view === "month") prev.setMonth(prev.getMonth() - 1);
                  else prev.setDate(prev.getDate() - 7);
                  setCurrentDate(prev);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                ‹
              </button>
              <span className="text-base font-semibold text-gray-900 min-w-0 text-center truncate max-w-[120px]">
                {formatHeaderDate()}
              </span>
              <button
                onClick={() => {
                  const next = new Date(currentDate);
                  if (view === "month") next.setMonth(next.getMonth() + 1);
                  else next.setDate(next.getDate() + 7);
                  setCurrentDate(next);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                ›
              </button>
            </div>

            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("month")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === "month"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === "week"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Week
              </button>
            </div>
          </div>

          <Calendar
            localizer={localizer}
            events={calendarEvents}
            view={view}
            date={currentDate}
            onNavigate={handleNavigate}
            onView={() => {}}
            onSelectEvent={handleSelectEvent}
            style={{ height: 600 }}
            toolbar={false}
            eventPropGetter={(calEvent) => {
              const ev = calEvent as CalendarEvent;
              return {
                style: {
                  backgroundColor: ev.bg,
                  borderColor: ev.bg,
                  color: "#ffffff",
                  borderRadius: "4px",
                  fontSize: "12px",
                },
              };
            }}
          />
        </div>
      )}
    </div>
  );
};
