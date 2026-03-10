import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchEventById } from "../store/events.slice";
import { eventsApi } from "../api/events.api";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Button } from "../components/common/Button";
import { Skeleton } from "../components/common/Skeleton";
import { combineDateAndTime, toLocalDateTimeInput } from "../utils/date.utils";

const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    location: z.string().min(2, "Location is required"),
    capacity: z.string().optional(),
    visibility: z.enum(["public", "private"]),
  })
  .refine(
    (data) => {
      const combined = new Date(`${data.date}T${data.time}`);
      return combined > new Date();
    },
    { message: "Event date must be in the future", path: ["date"] },
  );

type EventFormData = z.infer<typeof eventSchema>;

export const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { selectedEvent: event, isLoading } = useSelector(
    (state: RootState) => state.events,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (id) dispatch(fetchEventById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (event) {
      if (currentUser && event.organizer.id !== currentUser.id) {
        navigate(`/events/${event.id}`, { replace: true });
        return;
      }
      const { date, time } = toLocalDateTimeInput(event.date);
      reset({
        title: event.title,
        description: event.description,
        date,
        time,
        location: event.location,
        capacity: event.capacity?.toString() ?? "",
        visibility: event.visibility,
      });
    }
  }, [event, currentUser, navigate, reset]);

  const onSubmit = async (data: EventFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const isoDate = combineDateAndTime(data.date, data.time);
      await eventsApi.update(id, {
        title: data.title,
        description: data.description,
        date: isoDate,
        location: data.location,
        capacity: data.capacity ? parseInt(data.capacity, 10) : null,
        visibility: data.visibility,
      });
      navigate(`/events/${id}`);
    } catch {
      setError("Failed to update event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Event</h1>
        <p className="text-gray-500 text-sm mb-6">Update your event details</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.title && (
              <span className="text-red-500 text-xs">
                {errors.title.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              {...register("description")}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
            {errors.description && (
              <span className="text-red-500 text-xs">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("date")}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.date && (
                <span className="text-red-500 text-xs">
                  {errors.date.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                {...register("time")}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.time && (
                <span className="text-red-500 text-xs">
                  {errors.time.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("location")}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.location && (
              <span className="text-red-500 text-xs">
                {errors.location.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Capacity (optional)
            </label>
            <input
              type="number"
              min={1}
              placeholder="Leave empty for unlimited"
              {...register("capacity")}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Visibility
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="public"
                {...register("visibility")}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">
                Public — Anyone can see and join this event
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="private"
                {...register("visibility")}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">
                Private — Only invited people can see this event
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
