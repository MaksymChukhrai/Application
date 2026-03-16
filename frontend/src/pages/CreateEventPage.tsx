import { useState, useEffect } from "react";                           // ← useEffect
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";                // ← Stage #2
import type { AppDispatch, RootState } from "../store";                // ← Stage #2
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { eventsApi } from "../api/events.api";
import { fetchTags } from "../store/tags.slice";                       // ← Stage #2
import { Button } from "../components/common/Button";
import { combineDateAndTime } from "../utils/date.utils";

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

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();                         // ← Stage #2
  const { items: allTags } = useSelector(                             // ← Stage #2
    (state: RootState) => state.tags,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);  // ← Stage #2
  const [tagError, setTagError] = useState<string | null>(null);       // ← Stage #2

  // ── Stage #2: загружаем теги если ещё не загружены ─
  useEffect(() => {
    if (allTags.length === 0) dispatch(fetchTags());
  }, [dispatch, allTags.length]);
  // ───────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: { visibility: "public" },
  });

  // ── Stage #2: toggle тега ──────────────────────────
  const handleTagToggle = (tagId: string) => {
    setTagError(null);
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      if (prev.length >= 5) {
        setTagError("Maximum 5 tags allowed");
        return prev;
      }
      return [...prev, tagId];
    });
  };
  // ───────────────────────────────────────────────────

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const isoDate = combineDateAndTime(data.date, data.time);
      const event = await eventsApi.create({
        title: data.title,
        description: data.description,
        date: isoDate,
        location: data.location,
        capacity: data.capacity ? parseInt(data.capacity, 10) : null,
        visibility: data.visibility,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined, // ← Stage #2
      });
      navigate(`/events/${event.id}`);
    } catch {
      setError("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Create New Event
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Fill in the details to create an amazing event
        </p>

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
              placeholder="e.g., Tech Conference 2025"
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
              placeholder="Describe what makes your event special..."
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
              placeholder="e.g., Convention Center, San Francisco"
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
            <span className="text-gray-400 text-xs">
              Maximum number of participants. Leave empty for unlimited
              capacity.
            </span>
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

          {/* ── Stage #2: Tags multi-select ───────────── */}
          {allTags.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Tags{" "}
                <span className="text-gray-400 font-normal">
                  (optional, max 5)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs
                        font-medium capitalize transition-all duration-150 cursor-pointer
                        ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }
                      `}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
              {tagError && (
                <span className="text-red-500 text-xs">{tagError}</span>
              )}
              {selectedTagIds.length > 0 && (
                <span className="text-gray-400 text-xs">
                  {selectedTagIds.length} / 5 tags selected
                </span>
              )}
            </div>
          )}
          {/* ─────────────────────────────────────────── */}

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
              isLoading={isLoading}
              className="flex-1"
            >
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};