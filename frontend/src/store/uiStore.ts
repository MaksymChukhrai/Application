import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalendarView } from "../types";

interface UiState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearchQuery: () => void;

  calendarView: CalendarView;
  setCalendarView: (view: CalendarView) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearSearchQuery: () => set({ searchQuery: "" }),

      calendarView: "month",
      setCalendarView: (view) => set({ calendarView: view }),
    }),
    {
      name: "ui-preferences",

      partialize: (state) => ({ calendarView: state.calendarView }),
    },
  ),
);
