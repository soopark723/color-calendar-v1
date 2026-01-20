import React from "react";
import type { Event, Category } from "../../shared/api-types";

interface EventChipProps {
  event: Event;
  category: Category | null;
  onClick?: (event: Event) => void;
}

/**
 * Compact event chip for display in calendar day cells.
 * Uses the event's category color as background, or a default gray if no category.
 * Clickable when onClick handler is provided.
 */
export const EventChip: React.FC<EventChipProps> = ({
  event,
  category,
  onClick,
}) => {
  const bgColor = category?.color ?? "#6b7280"; // Default gray if no category

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={`mb-1 truncate rounded px-1.5 py-0.5 text-xs text-white transition-opacity ${
        onClick
          ? "cursor-pointer hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1"
          : ""
      }`}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `Edit event: ${event.title}` : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      style={{ backgroundColor: bgColor }}
      title={event.title}
    >
      {event.title}
    </div>
  );
};
