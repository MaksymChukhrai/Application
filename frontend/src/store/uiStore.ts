import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalendarView } from "../types";

interface UiState {
  // ── Events page search ─────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearchQuery: () => void;

  // ── Calendar view preference ───────────────────────────────
  calendarView: CalendarView;
  setCalendarView: (view: CalendarView) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // Search — default empty
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearSearchQuery: () => set({ searchQuery: "" }),

      // Calendar — default month, persisted to localStorage
      calendarView: "month",
      setCalendarView: (view) => set({ calendarView: view }),
    }),
    {
      name: "ui-preferences",
      // Only persist calendarView — search resets on page reload
      partialize: (state) => ({ calendarView: state.calendarView }),
    }
  )
);