import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  fetchEventById,
  deleteEvent,
  joinEvent,
  leaveEvent,
  optimisticJoin,
  optimisticLeave,
  clearSelectedEvent,
} from "../store/events.slice";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { ParticipantList } from "../components/events/ParticipantList";
import { Skeleton } from "../components/common/Skeleton";
import { formatEventDateTime } from "../utils/date.utils";

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const {
    selectedEvent: event,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.events);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchEventById(id));
    return () => {
      dispatch(clearSelectedEvent());
    };
  }, [id, dispatch]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Event not found</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate("/events")}
        >
          Back to Events
        </Button>
      </div>
    );
  }

  const isOrganizer = currentUser?.id === event.organizer.id;
  const isJoined = event.isJoined;
  const isFull = event.isFull;

  const handleJoinLeave = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setIsActionLoading(true);
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
    setIsActionLoading(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const result = await dispatch(deleteEvent(id));
    if (deleteEvent.fulfilled.match(result)) {
      navigate("/events", { replace: true });
    }
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-sm text-gray-500">
              Organized by{" "}
              <span className="font-medium text-gray-700">
                {event.organizer.firstName} {event.organizer.lastName}
              </span>
            </p>
          </div>

          {isOrganizer && (
            <div className="flex gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/events/${event.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">
          {event.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formatEventDateTime(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>
              {event.participantCount}
              {event.capacity !== null ? ` / ${event.capacity}` : ""}{" "}
              participants
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span className="capitalize">{event.visibility}</span>
          </div>
        </div>

        {!isOrganizer && (
          <div>
            {isFull && !isJoined ? (
              <Button
                variant="secondary"
                size="lg"
                disabled
                className="w-full sm:w-auto"
              >
                Event is Full
              </Button>
            ) : (
              <Button
                variant={isJoined ? "secondary" : "primary"}
                size="lg"
                isLoading={isActionLoading}
                className="w-full sm:w-auto"
                onClick={handleJoinLeave}
              >
                {isJoined ? "Leave Event" : "Join Event"}
              </Button>
            )}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Participants ({event.participantCount})
          </h2>
          <ParticipantList participants={event.participants} />
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Event"
        confirmLabel="Delete"
        isDangerous
        isConfirmLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        Are you sure you want to delete this event? This action cannot be
        undone.
      </Modal>
    </div>
  );
};
