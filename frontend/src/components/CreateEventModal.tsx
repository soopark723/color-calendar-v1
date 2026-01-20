import React, { useEffect, useRef, useState } from "react";
import type { Category, Event } from "../../shared/api-types";

interface CreateEventModalProps {
  selectedDate: Date;
  categories: Category[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string | null;
    startAt: string;
    endAt: string;
    allDay: boolean;
    categoryId?: string | null;
  }) => Promise<void>;
  event?: Event | null; // If provided, modal is in edit mode
}

/**
 * Modal for creating or editing events.
 * Handles form state, validation, and submission.
 */
export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  selectedDate,
  categories,
  onClose,
  onSave,
  event,
}) => {
  const isEditMode = !!event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [allDay, setAllDay] = useState(event?.allDay ?? true);
  const [categoryId, setCategoryId] = useState<string | null>(
    event?.categoryId ?? null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const getInitialStartTime = (): string => {
    if (event && !event.allDay) {
      const start = new Date(event.startAt);
      const hours = start.getHours().toString().padStart(2, "0");
      const minutes = start.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "09:00";
  };

  const getInitialEndTime = (): string => {
    if (event && !event.allDay) {
      const end = new Date(event.endAt);
      const hours = end.getHours().toString().padStart(2, "0");
      const minutes = end.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "10:00";
  };

  const [startTime, setStartTime] = useState(getInitialStartTime());
  const [endTime, setEndTime] = useState(getInitialEndTime());

  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Escape key closes modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, saving]);

  // Focus management: auto-focus input, trap focus in modal
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, []);

  // Sync form state when event prop changes (edit mode)
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setAllDay(event.allDay);
      setCategoryId(event.categoryId ?? null);
      if (!event.allDay) {
        const start = new Date(event.startAt);
        const end = new Date(event.endAt);
        setStartTime(
          `${start.getHours().toString().padStart(2, "0")}:${start
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        );
        setEndTime(
          `${end.getHours().toString().padStart(2, "0")}:${end
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        );
      }
    }
    setHasSubmitted(false);
    setError(null);
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (saving || hasSubmitted) {
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setSaving(true);
      setHasSubmitted(true);
      setError(null);

      // Build ISO datetime strings for startAt/endAt
      let startAt: string;
      let endAt: string;

      if (allDay) {
        // All-day: 00:00 UTC on date, end at 00:00 UTC next day (exclusive)
        const baseDate = isEditMode && event ? new Date(event.startAt) : selectedDate;
        const start = new Date(
          Date.UTC(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            0,
            0,
            0,
            0
          )
        );
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        startAt = start.toISOString();
        endAt = end.toISOString();
      } else {
        // Timed: use base date with local timezone hours/minutes
        const baseDate = isEditMode && event ? new Date(event.startAt) : selectedDate;
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        const start = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          startHour,
          startMinute,
          0,
          0
        );
        const end = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          endHour,
          endMinute,
          0,
          0
        );

        if (end <= start) {
          setError("End time must be after start time");
          setSaving(false);
          return;
        }
        startAt = start.toISOString();
        endAt = end.toISOString();
      }

      await onSave({
        title: title.trim(),
        startAt,
        endAt,
        allDay,
        categoryId: categoryId || null,
      });

      // Close modal on success
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
          ? "Failed to update event"
          : "Failed to create event"
      );
      setHasSubmitted(false); // Allow retry on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="modal-title"
          className="mb-4 text-xl font-semibold text-slate-900"
        >
          {isEditMode ? "Edit Event" : "Create Event"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Event title"
              required
            />
          </div>

          {/* All-day checkbox */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                All-day event
              </span>
            </label>
          </div>

          {/* Time fields (only shown if not all-day) */}
          {!allDay && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Start time
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  End time
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Category selector */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Category
            </label>
            <select
              id="category"
              value={categoryId || ""}
              onChange={(e) =>
                setCategoryId(e.target.value || null)
              }
              className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? "Saving..." : isEditMode ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
