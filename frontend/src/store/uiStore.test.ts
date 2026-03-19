import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "./uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ searchQuery: "", calendarView: "month" });
  });

  it("setSearchQuery / clearSearchQuery — updates and resets search query", () => {
    useUiStore.getState().setSearchQuery("React conference");
    expect(useUiStore.getState().searchQuery).toBe("React conference");

    useUiStore.getState().clearSearchQuery();
    expect(useUiStore.getState().searchQuery).toBe("");
  });
});