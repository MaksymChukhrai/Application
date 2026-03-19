import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io, type Socket } from "socket.io-client";
import type { RootState } from "../store";
import { useNotificationsStore } from "../store/notificationsStore";

interface ParticipantPayload {
  eventId: string;
  eventTitle: string;
  userName: string;
}

interface EventCreatedPayload {
  eventId: string;
  title: string;
  organizerName: string;
}

export const useSocket = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const socketRef = useRef<Socket | null>(null);

  const isAuthenticated = !!user && !!accessToken;

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const apiUrl = import.meta.env.VITE_API_URL as string;

    const socket = io(`${apiUrl}/events`, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", user.id);
    });

    socket.on("participant:joined", (payload: ParticipantPayload) => {
      addNotification(
        `${payload.userName} joined "${payload.eventTitle}"`,
        "success",
      );
    });

    socket.on("participant:left", (payload: ParticipantPayload) => {
      addNotification(
        `${payload.userName} left "${payload.eventTitle}"`,
        "warning",
      );
    });

    socket.on("event:created", (payload: EventCreatedPayload) => {
      addNotification(
        `New event: "${payload.title}" by ${payload.organizerName}`,
        "info",
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);
};
