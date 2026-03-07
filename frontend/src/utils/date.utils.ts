import { format, parseISO, isValid } from "date-fns";

export const formatEventDate = (isoString: string): string => {
  const date = parseISO(isoString);
  if (!isValid(date)) return "Invalid date";
  return format(date, "MMM dd, yyyy");
};

export const formatEventTime = (isoString: string): string => {
  const date = parseISO(isoString);
  if (!isValid(date)) return "";
  return format(date, "HH:mm");
};

export const formatEventDateTime = (isoString: string): string => {
  const date = parseISO(isoString);
  if (!isValid(date)) return "Invalid date";
  return format(date, "MMM dd, yyyy · HH:mm");
};

export const toLocalDateTimeInput = (
  isoString: string,
): { date: string; time: string } => {
  const date = parseISO(isoString);
  if (!isValid(date)) return { date: "", time: "" };
  return {
    date: format(date, "yyyy-MM-dd"),
    time: format(date, "HH:mm"),
  };
};

export const combineDateAndTime = (date: string, time: string): string => {
  return new Date(`${date}T${time}:00`).toISOString();
};

export const isPastDate = (isoString: string): boolean => {
  return new Date(isoString) < new Date();
};
