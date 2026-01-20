/**
 * Shared TypeScript types for the calendar app.
 *
 * These mirror the backend Prisma models and HTTP response shapes, but:
 * - use ISO8601 strings for all date/time fields
 * - avoid any imports so they can be consumed by both frontend and backend
 *
 * Keep this file as the single source of truth for API payloads.
 */

/**
 * Category: user-defined grouping for events (e.g. Work, Personal).
 *
 * `color` is stored as a 6-digit hex string (e.g. "#3b82f6").
 */
export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
};

/**
 * Event: a scheduled activity.
 *
 * Uses ISO strings for temporal fields so JSON round-trips cleanly.
 */
export type Event = {
  id: string;
  title: string;
  description: string | null;
  startAt: string; // ISO datetime string, inclusive
  endAt: string; // ISO datetime string, exclusive
  allDay: boolean;
  categoryId: string | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
};

/**
 * GET /api/categories response payload.
 */
export type GetCategoriesResponse = {
  categories: Category[];
};

/**
 * GET /api/events?from=ISO&to=ISO response payload.
 */
export type GetEventsResponse = {
  events: Event[];
};

