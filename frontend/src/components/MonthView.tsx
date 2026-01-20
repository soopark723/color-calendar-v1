import React from "react";
import type { Event, Category } from "../../shared/api-types";
import { EventChip } from "./EventChip";

interface MonthViewProps {
  year: number;
  month: number; // 0-indexed (0 = January, 11 = December)
  events: Event[];
  categories: Category[];
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

/**
 * Month calendar grid view.
 * Renders a 7-column grid (Sunday–Saturday) showing all days of the month
 * plus leading/trailing days from adjacent months to fill the grid.
 */
export const MonthView: React.FC<MonthViewProps> = ({
  year,
  month,
  events,
  categories,
  onDayClick,
  onEventClick,
}) => {
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  // Calculate leading/trailing days to fill 6-row grid (42 cells)
  const leadingDays: Date[] = [];
  if (startDayOfWeek > 0) {
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      leadingDays.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
  }

  const currentMonthDays: Date[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    currentMonthDays.push(new Date(year, month, day));
  }

  const totalCells = leadingDays.length + currentMonthDays.length;
  const trailingDays: Date[] = [];
  const remainingCells = 42 - totalCells;
  for (let day = 1; day <= remainingCells; day++) {
    trailingDays.push(new Date(year, month + 1, day));
  }

  const allDays = [...leadingDays, ...currentMonthDays, ...trailingDays];

  // Check if event occurs on a given date
  // All-day events: compare date components only (endAt is exclusive)
  // Timed events: check if date overlaps event's time range
  const eventOccursOnDate = (event: Event, date: Date): boolean => {
    const eventStart = new Date(event.startAt);
    const eventEnd = new Date(event.endAt);

    if (event.allDay) {
      // Normalize to date-only for comparison (endAt is exclusive, so < not <=)
      const eventStartDate = new Date(
        eventStart.getFullYear(),
        eventStart.getMonth(),
        eventStart.getDate()
      );
      const eventEndDate = new Date(
        eventEnd.getFullYear(),
        eventEnd.getMonth(),
        eventEnd.getDate()
      );
      const checkDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      return checkDate >= eventStartDate && checkDate < eventEndDate;
    }

    // Timed events: check if date's 24h range overlaps event
    const checkDateStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const checkDateEnd = new Date(checkDateStart);
    checkDateEnd.setDate(checkDateEnd.getDate() + 1);
    return eventStart < checkDateEnd && eventEnd > checkDateStart;
  };

  /**
   * Get events that occur on a given date.
   */
  const getEventsForDate = (date: Date): Event[] => {
    return events.filter((event) => eventOccursOnDate(event, date));
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month && date.getFullYear() === year;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px border-b border-slate-200 bg-slate-200">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="bg-white py-2 text-center text-sm font-semibold text-slate-700"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {allDays.map((date, idx) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDay = isToday(date);

          return (
            <div
              key={idx}
              onClick={() => onDayClick?.(date)}
              className={`min-h-[80px] sm:min-h-[100px] bg-white p-1 transition-colors ${
                !isCurrentMonthDay ? "text-slate-400" : "text-slate-900"
              } ${
                onDayClick
                  ? "cursor-pointer hover:bg-slate-50 focus-within:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset"
                  : ""
              }`}
              tabIndex={onDayClick ? 0 : undefined}
              role={onDayClick ? "button" : undefined}
              aria-label={
                onDayClick
                  ? `Create event on ${date.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}`
                  : undefined
              }
              onKeyDown={
                onDayClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onDayClick(date);
                      }
                    }
                  : undefined
              }
            >
              <div
                className={`mb-1 text-sm font-medium ${
                  isTodayDay
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
                    : ""
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.length === 0 && isCurrentMonthDay ? (
                  <div className="text-xs text-slate-400">No events</div>
                ) : (
                  dayEvents.map((event) => {
                    const category = event.categoryId
                      ? categoryMap.get(event.categoryId) ?? null
                      : null;
                    return (
                      <EventChip
                        key={event.id}
                        event={event}
                        category={category}
                        onClick={onEventClick}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
