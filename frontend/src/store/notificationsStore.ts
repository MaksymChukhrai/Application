import { create } from "zustand";

export type NotificationType = "info" | "success" | "warning";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
}

interface NotificationsState {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],

  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        {
          id: crypto.randomUUID(),
          message,
          type,
          createdAt: new Date(),
        },
        ...state.notifications,
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));