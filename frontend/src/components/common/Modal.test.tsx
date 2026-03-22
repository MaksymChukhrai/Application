/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders when open and calls onClose on cancel click", () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <Modal
        isOpen={true}
        title="Delete Event"
        onClose={handleClose}
        onConfirm={handleConfirm}
      >
        Are you sure?
      </Modal>
    );

    expect(screen.getByText("Delete Event")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});