import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUiStore } from "../store/uiStore";

export const useUiEffects = () => {
  const clearSearchQuery = useUiStore((s) => s.clearSearchQuery);
  const location = useLocation();

  // Effect: clear search query when navigating away from /events
  useEffect(() => {
    if (!location.pathname.startsWith("/events")) {
      clearSearchQuery();
    }
  }, [location.pathname, clearSearchQuery]);
};