import apiClient from "./axios.instance";
import type { Event } from "../types";

export const usersApi = {
  getMyEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>("/users/me/events");
    return response.data;
  },
};
