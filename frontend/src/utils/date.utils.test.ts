import { describe, it, expect } from "vitest";
import {
  formatEventDate,
  formatEventTime,
  toLocalDateTimeInput,
  combineDateAndTime,
  isPastDate,
} from "./date.utils";

describe("date.utils", () => {
  const validISO = "2025-06-15T14:30:00.000Z";

  it("formatEventDate — formats valid ISO string to readable date", () => {
    const result = formatEventDate(validISO);
    // format depends on UTC offset, so we check pattern MMM dd, yyyy
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{2}, \d{4}$/);
  });

  it("formatEventDate — returns 'Invalid date' for invalid input", () => {
    expect(formatEventDate("not-a-date")).toBe("Invalid date");
  });

  it("formatEventTime — returns HH:mm string for valid ISO", () => {
    const result = formatEventTime(validISO);
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("formatEventTime — returns empty string for invalid input", () => {
    expect(formatEventTime("bad-input")).toBe("");
  });

  it("toLocalDateTimeInput — splits ISO into date and time parts", () => {
    const result = toLocalDateTimeInput(validISO);
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.time).toMatch(/^\d{2}:\d{2}$/);
  });

  it("toLocalDateTimeInput — returns empty strings for invalid input", () => {
    const result = toLocalDateTimeInput("invalid");
    expect(result).toEqual({ date: "", time: "" });
  });

it("combineDateAndTime — combines date and time into ISO string", () => {
  const result = combineDateAndTime("2025-06-15", "14:30");
  expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  expect(new Date(result).toDateString()).toContain("Jun 15 2025");
});

  it("isPastDate — returns true for past date", () => {
    expect(isPastDate("2000-01-01T00:00:00.000Z")).toBe(true);
  });

  it("isPastDate — returns false for future date", () => {
    expect(isPastDate("2099-01-01T00:00:00.000Z")).toBe(false);
  });
});