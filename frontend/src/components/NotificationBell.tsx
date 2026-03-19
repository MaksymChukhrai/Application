// frontend/src/components/NotificationBell.tsx
import { useEffect, useRef, useState } from "react";
import { useNotificationsStore } from "../store/notificationsStore";
import type { Notification, NotificationType } from "../store/notificationsStore";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICON: Record<NotificationType, string> = {
  success: "✅",
  warning: "⚠️",
  info: "ℹ️",
};

const TYPE_DOT: Record<NotificationType, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  info:    "bg-indigo-500",
};

// ─── Presentational sub-components ───────────────────────

const NotificationItem = ({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: (id: string) => void;
}) => (
  <div className="flex items-start gap-2 px-3 py-2 hover:bg-gray-50 group">
    <span className="mt-0.5 text-sm flex-shrink-0">
      {TYPE_ICON[notification.type]}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-800 leading-snug break-words">
        {notification.message}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">
        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
      </p>
    </div>
    <button
      onClick={() => onRemove(notification.id)}
      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400
                 hover:text-gray-600 transition-opacity text-xs leading-none mt-0.5"
      aria-label="Dismiss notification"
    >
      ✕
    </button>
  </div>
);

// ─── Pure presentational component (Storybook-friendly) ──

export interface NotificationBellUIProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationBellUI = ({
  notifications,
  onRemove,
  onClearAll,
}: NotificationBellUIProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const count = notifications.length;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-8 h-8 rounded-full
                   text-gray-500 hover:text-gray-900 hover:bg-gray-100
                   transition-colors duration-150"
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
      >
        <span className="text-lg leading-none">🔔</span>

        {/* Badge */}
        {count > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5
                       bg-red-500 text-white text-[10px] font-bold leading-4
                       rounded-full flex items-center justify-center"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-10 w-80 bg-white border border-gray-200
                     rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            {count > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-indigo-600 hover:text-indigo-800
                           font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {count === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-gray-400">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRemove={onRemove}
                />
              ))
            )}
          </div>

          {/* Footer — type legend */}
          {count > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex gap-3">
              {(Object.entries(TYPE_DOT) as [NotificationType, string][]).map(
                ([type, dotClass]) => (
                  <span
                    key={type}
                    className="flex items-center gap-1 text-xs text-gray-400"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                    {type}
                  </span>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Connected component (используется в Navbar) ──────────

export const NotificationBell = () => {
  const { notifications, removeNotification, clearAll } =
    useNotificationsStore();

  return (
    <NotificationBellUI
      notifications={notifications}
      onRemove={removeNotification}
      onClearAll={clearAll}
    />
  );
};