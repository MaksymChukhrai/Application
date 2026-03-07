export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
}

export interface Organizer {
  id: string;
  name: string;
  email: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number | null;
  visibility: "public" | "private";
  participantsCount: number;
  organizer: Organizer;
  participants: Participant[];
  isJoined?: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity?: number | null;
  visibility: "public" | "private";
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number | null;
  visibility?: "public" | "private";
}

export type CalendarView = "month" | "week";
