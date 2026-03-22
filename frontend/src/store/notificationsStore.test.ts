import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationsStore } from "./notificationsStore";

describe("notificationsStore", () => {
  beforeEach(() => {
    useNotificationsStore.setState({ notifications: [] });
  });

  it("addNotification — adds notification to the store", () => {
    useNotificationsStore.getState().addNotification("Test message", "success");

    const { notifications } = useNotificationsStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].message).toBe("Test message");
    expect(notifications[0].type).toBe("success");
  });
});