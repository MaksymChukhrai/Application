import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import type { Event } from "../../types";
import {
  optimisticJoin,
  optimisticLeave,
  joinEvent,
  leaveEvent,
} from "../../store/events.slice";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Button } from "../common/Button";
import { formatEventDate, formatEventTime } from "../../utils/date.utils";

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  const isFull = event.isFull;
  const isJoined = event.isJoined;

  const handleJoinLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (isJoined) {
      dispatch(optimisticLeave({ eventId: event.id, userId: currentUser.id }));
      const result = await dispatch(leaveEvent(event.id));
      if (leaveEvent.rejected.match(result)) {
        dispatch(optimisticJoin({ eventId: event.id, userId: currentUser.id }));
      }
    } else {
      dispatch(optimisticJoin({ eventId: event.id, userId: currentUser.id }));
      const result = await dispatch(joinEvent(event.id));
      if (joinEvent.rejected.match(result)) {
        dispatch(
          optimisticLeave({ eventId: event.id, userId: currentUser.id }),
        );
      }
    }
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <h3 className="font-semibold text-gray-900 text-base leading-snug">
        {event.title}
      </h3>

      <p className="text-gray-500 text-sm line-clamp-2">{event.description}</p>

      <div className="flex flex-col gap-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{formatEventDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🕐</span>
          <span>{formatEventTime(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👥</span>
          <span>
            {event.participantCount}
            {event.capacity !== null ? ` / ${event.capacity}` : ""} participants
          </span>
        </div>
      </div>

      <div className="mt-auto pt-2">
        {isFull && !isJoined ? (
          <Button variant="secondary" size="md" disabled className="w-full">
            Full
          </Button>
        ) : (
          <Button
            variant={isJoined ? "secondary" : "primary"}
            size="md"
            className="w-full"
            onClick={handleJoinLeave}
          >
            {isJoined ? "Leave Event" : "Join Event"}
          </Button>
        )}
      </div>
    </div>
  );
};
