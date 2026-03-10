import apiClient from "./axios.instance";
import type { Event, CreateEventPayload, UpdateEventPayload } from "../types";

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>("/events");
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },

  create: async (payload: CreateEventPayload): Promise<Event> => {
    const response = await apiClient.post<Event>("/events", payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateEventPayload): Promise<Event> => {
    const response = await apiClient.patch<Event>(`/events/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  join: async (id: string): Promise<Event> => {
    const response = await apiClient.post<Event>(`/events/${id}/join`);
    return response.data;
  },

  leave: async (id: string): Promise<Event> => {
    const response = await apiClient.post<Event>(`/events/${id}/leave`);
    return response.data;
  },
};
