import React, { useEffect, useState } from "react";
import type { Category, Event } from "../../shared/api-types";
import { fetchCategories, fetchEvents, createEvent, updateEvent, deleteEvent } from "../api";
import { MonthView } from "./MonthView";
import { CreateEventModal } from "./CreateEventModal";

/**
 * Main calendar page component.
 * Manages calendar state, data fetching, and modal interactions.
 */
export const CalendarPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch categories once on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesRes = await fetchCategories();
        setCategories(categoriesRes.categories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load categories"
        );
      }
    };

    loadCategories();
  }, []);

  // Fetch events when visible month changes
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Query range: first day of month (00:00 UTC) to first day of next month (exclusive)
        const from = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        const to = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));

        // Fetch events for the visible month range
        const eventsRes = await fetchEvents({
          from: from.toISOString(),
          to: to.toISOString(),
        });

        setEvents(eventsRes.events);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load events"
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null); // Clear event selection when clicking a day
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    // Set selectedDate to the event's start date for the modal
    setSelectedDate(new Date(event.startAt));
  };

  const handleDeleteEvent = async (id: string) => {
  // Optimistic UI: remove immediately
  setEvents((prev) => prev.filter((e) => e.id !== id));

  try {
    await deleteEvent(id);
  } catch (err) {
    // Rollback if delete fails
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const from = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));

    const eventsRes = await fetchEvents({
      from: from.toISOString(),
      to: to.toISOString(),
    });

    setEvents(eventsRes.events);
    throw err;
    }
  };

  const handleCloseModal = () => {
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async (data: {
    title: string;
    description?: string | null;
    startAt: string;
    endAt: string;
    allDay: boolean;
    categoryId?: string | null;
  }) => {
    // Optimistic UI: show changes immediately, rollback on error
    const tempEventId = `temp-${Date.now()}`;
    const optimisticEvent: Event = selectedEvent
      ? { ...selectedEvent, ...data, updatedAt: new Date().toISOString() }
      : {
          id: tempEventId,
          title: data.title,
          description: data.description ?? null,
          startAt: data.startAt,
          endAt: data.endAt,
          allDay: data.allDay,
          categoryId: data.categoryId ?? null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    if (selectedEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === selectedEvent.id ? optimisticEvent : e))
      );
    } else {
      setEvents((prev) => [...prev, optimisticEvent]);
    }

    try {
      if (selectedEvent) {
        const result = await updateEvent(selectedEvent.id, data);
        setEvents((prev) =>
          prev.map((e) => (e.id === selectedEvent.id ? result.event : e))
        );
      } else {
        const result = await createEvent(data);
        setEvents((prev) =>
          prev.map((e) => (e.id === tempEventId ? result.event : e))
        );
      }
    } catch (err) {
      // Rollback: refetch to restore correct state
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const from = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const to = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));

      const eventsRes = await fetchEvents({
        from: from.toISOString(),
        to: to.toISOString(),
      });

      setEvents(eventsRes.events);
      // Re-throw error so modal can display it
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded bg-red-50 px-4 py-3 text-red-800">
          Error: {error}
        </div>
      </div>
    );
  }

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
            {monthName}
          </h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handlePreviousMonth}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Previous month"
            >
              Previous
            </button>
            <button
              onClick={handleToday}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Go to today"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Next month"
            >
              Next
            </button>
          </div>
        </div>

        {/* Month View */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <MonthView
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
            events={events}
            categories={categories}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      {selectedDate && (
        <CreateEventModal
          selectedDate={selectedDate}
          categories={categories}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={selectedEvent}
        />
      )}
    </main>
  );
};
