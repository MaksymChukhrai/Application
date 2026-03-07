import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Event } from "../types";
import { eventsApi } from "../api/events.api";

interface EventsState {
  items: Event[];
  selectedEvent: Event | null;
  myEvents: Event[];
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  selectedEvent: null,
  myEvents: [],
  isLoading: false,
  isActionLoading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk<
  Event[],
  void,
  { rejectValue: string }
>("events/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await eventsApi.getAll();
  } catch {
    return rejectWithValue("Failed to load events");
  }
});

export const fetchEventById = createAsyncThunk<
  Event,
  string,
  { rejectValue: string }
>("events/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await eventsApi.getById(id);
  } catch {
    return rejectWithValue("Failed to load event");
  }
});

export const deleteEvent = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("events/delete", async (id, { rejectWithValue }) => {
  try {
    await eventsApi.delete(id);
    return id;
  } catch {
    return rejectWithValue("Failed to delete event");
  }
});

export const joinEvent = createAsyncThunk<
  Event,
  string,
  { rejectValue: string }
>("events/join", async (id, { rejectWithValue }) => {
  try {
    return await eventsApi.join(id);
  } catch {
    return rejectWithValue("Failed to join event");
  }
});

export const leaveEvent = createAsyncThunk<
  Event,
  string,
  { rejectValue: string }
>("events/leave", async (id, { rejectWithValue }) => {
  try {
    return await eventsApi.leave(id);
  } catch {
    return rejectWithValue("Failed to leave event");
  }
});

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearSelectedEvent(state) {
      state.selectedEvent = null;
    },
    clearError(state) {
      state.error = null;
    },
    optimisticJoin(
      state,
      action: PayloadAction<{ eventId: string; userId: string }>,
    ) {
      const { eventId, userId } = action.payload;
      const item = state.items.find((e) => e.id === eventId);
      if (item) {
        item.participantsCount += 1;
        item.isJoined = true;
        item.participants = [
          ...item.participants,
          { id: userId, name: "", email: "" },
        ];
      }
      if (state.selectedEvent?.id === eventId) {
        state.selectedEvent.participantsCount += 1;
        state.selectedEvent.isJoined = true;
      }
    },
    optimisticLeave(
      state,
      action: PayloadAction<{ eventId: string; userId: string }>,
    ) {
      const { eventId, userId } = action.payload;
      const item = state.items.find((e) => e.id === eventId);
      if (item) {
        item.participantsCount = Math.max(0, item.participantsCount - 1);
        item.isJoined = false;
        item.participants = item.participants.filter((p) => p.id !== userId);
      }
      if (state.selectedEvent?.id === eventId) {
        state.selectedEvent.participantsCount = Math.max(
          0,
          state.selectedEvent.participantsCount - 1,
        );
        state.selectedEvent.isJoined = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchEvents.fulfilled,
        (state, action: PayloadAction<Event[]>) => {
          state.isLoading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchEventById.fulfilled,
        (state, action: PayloadAction<Event>) => {
          state.isLoading = false;
          state.selectedEvent = action.payload;
        },
      )
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(
        deleteEvent.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter((e) => e.id !== action.payload);
          state.selectedEvent = null;
        },
      )
      .addCase(joinEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isActionLoading = false;
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = action.payload;
        }
      })
      .addCase(joinEvent.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(leaveEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isActionLoading = false;
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = action.payload;
        }
      })
      .addCase(leaveEvent.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export const {
  clearSelectedEvent,
  clearError,
  optimisticJoin,
  optimisticLeave,
} = eventsSlice.actions;
export default eventsSlice.reducer;
