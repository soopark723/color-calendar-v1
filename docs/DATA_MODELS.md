## Core Data Models

This first version supports:

- Category color-coding (end-to-end)
- CRUD events
- Basic calendar rendering (month view)

### Category

Represents a user-defined grouping for events (Work/Personal/etc.).

**Fields**

- `id` (string): stable identifier (UUID)
- `name` (string): display name
- `color` (string): UI color token stored as hex (e.g. `#3b82f6`)
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Why store hex?**

- Works with any UI framework.
- Easy to migrate later to design-system tokens (`blue-500`, etc.) if desired.

### Event

Represents a scheduled activity.

**Fields**

- `id` (string): UUID
- `title` (string)
- `description` (string | null)
- `startAt` (datetime): inclusive
- `endAt` (datetime): exclusive (recommended for simpler duration math)
- `allDay` (boolean): for all-day events (future: might split date-only fields)
- `categoryId` (string | null): foreign key to Category (nullable for uncategorized)
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Invariants**

- `endAt` must be > `startAt`
- For all-day events, `startAt/endAt` still use timestamps (UI can treat them as date-only).

### API Shapes (initial)

- `GET /api/categories` → `{ categories: Category[] }`
- `GET /api/events?from=ISO&to=ISO` → `{ events: Event[] }`

Event responses include `categoryId`; the UI joins categories client-side to derive color.

