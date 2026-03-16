import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import eventsReducer from "./events.slice";
import tagsReducer from "./tags.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    tags: tagsReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
