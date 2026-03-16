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
  firstName: string;
  lastName: string;
  email: string;
}

export interface Organizer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number | null;
  visibility: "public" | "private";
  participantCount: number;
  isFull: boolean;
  isJoined: boolean;
  organizer: Organizer;
  participants: Participant[];
  tags: Tag[];
  createdAt?: string;
  updatedAt?: string;
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
  tagIds?: string[];
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number | null;
  visibility?: "public" | "private";
  tagIds?: string[];
}

export type CalendarView = "month" | "week";

export interface AskAiPayload {
  question: string;
}

export interface AskAiResponse {
  answer: string;
}
