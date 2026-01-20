## Architecture

### Goals

- **Clear separation**: UI (frontend) vs HTTP/API (backend) vs persistence/data models (DB/schema).
- **Production-minded**: typed contracts, validation, migrations, predictable data flow.
- **Easy to extend**: recurring events/reminders can be added without refactoring the whole stack.

### Monorepo Layout

```
/
  backend/               # Express API, Prisma schema, DB access
  frontend/              # React UI (Vite), Tailwind styles
  shared/                # Shared TypeScript types (API payloads, domain models)
  docs/
```

### Data Flow

- UI calls the backend with `fetch("/api/...")`.
- Backend validates input (Zod), reads/writes via Prisma, returns JSON payloads.
- UI renders calendar cells and events; events have a `categoryId` and are **styled using category color**.

### Major Components (Frontend)

- `CalendarPage`: view mode + date navigation + data loading
- `MonthView`: renders a month grid; places events into the correct day cell
- `EventChip`: compact visual representation of an event with category color

Week/Day views are intentionally stubbed initially to keep the first milestone small.

### Major Modules (Backend)

- `routes/categories.ts`: CRUD-ish endpoints for categories (initially list/create)
- `routes/events.ts`: CRUD endpoints for events (list/create/update/delete)
- `db/prisma.ts`: Prisma client singleton
- `validation/`: Zod schemas for request bodies

### Extensibility Notes

- **Recurring events**: add a `recurrenceRule` (iCal RRULE string) or a normalized recurrence table.
- **Reminders**: add `reminders` table with `eventId`, `minutesBefore`, `channel`.
- **Multi-user**: add `User` and tenant scoping; all queries filter by `userId`.

