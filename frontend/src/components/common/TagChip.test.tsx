/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TagChip from "./TagChip";

describe("TagChip", () => {
  it("renders tag name correctly", () => {
    const tag = { id: "1", name: "Tech" };
    render(<TagChip tag={tag} />);

    const chip = screen.getByText("Tech");
    expect(chip).toBeInTheDocument();
    expect(chip.tagName).toBe("SPAN");
  });
});