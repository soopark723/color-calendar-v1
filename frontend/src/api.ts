import type {
  Category,
  Event,
  GetCategoriesResponse,
  GetEventsResponse
} from "../shared/api-types";

const API_BASE = "/api";

/**
 * Fetch categories.
 */
export async function fetchCategories(): Promise<GetCategoriesResponse> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }
  return res.json() as Promise<{ categories: Category[] }>;
}

/**
 * Fetch events within an optional range.
 */
export async function fetchEvents(params: {
  from?: string;
  to?: string;
} = {}): Promise<GetEventsResponse> {
  const search = new URLSearchParams();
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);

  const qs = search.toString();
  const url = qs ? `${API_BASE}/events?${qs}` : `${API_BASE}/events`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }
  return res.json() as Promise<{ events: Event[] }>;
}

/**
 * Create a new event.
 */
export async function createEvent(data: {
  title: string;
  description?: string | null;
  startAt: string; // ISO datetime string
  endAt: string; // ISO datetime string
  allDay?: boolean;
  categoryId?: string | null;
}): Promise<{ event: Event }> {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = `Failed to create event (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parse errors, use default message
    }
    throw new Error(errorMessage);
  }

  return res.json() as Promise<{ event: Event }>;
}

/**
 * Update an existing event.
 */
export async function updateEvent(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    startAt?: string; // ISO datetime string
    endAt?: string; // ISO datetime string
    allDay?: boolean;
    categoryId?: string | null;
  }
): Promise<{ event: Event }> {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = `Failed to update event (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parse errors, use default message
    }
    throw new Error(errorMessage);
  }

  return res.json() as Promise<{ event: Event }>;
}
