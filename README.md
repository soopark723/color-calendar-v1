# Calendar Web App

A clean, minimal calendar application built with React, TypeScript, and Node.js. Features month view, category-colored events, and full CRUD operations with a focus on simplicity and developer experience.

## What It Does

This calendar app allows users to:

- **View events** in a month grid layout
- **Create events** by clicking on any day
- **Edit events** by clicking on event chips
- **Organize events** using color-coded categories
- **Navigate months** with Previous/Next/Today buttons

The app uses a month-aware data fetching strategy, only loading events for the visible month to optimize performance.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **No external UI libraries** (custom modal and components)

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** as ORM
- **SQLite** for database (easily migratable to PostgreSQL)

### Architecture
- **Monorepo structure** with separate frontend/backend
- **Shared TypeScript types** (`shared/` folder) to keep API contracts aligned
- **RESTful API** with clear separation of concerns

## Key Design Decisions

### 1. Month-Aware Data Fetching
Events are fetched only for the visible month using UTC date ranges. This reduces payload size and improves performance, especially as the event database grows.

### 2. Optimistic UI Updates
When creating or editing events, changes appear immediately in the UI. If the API call fails, the UI automatically rolls back to the correct state. This provides instant feedback while maintaining data integrity.

### 3. Shared Type Definitions
The `shared/api-types.ts` file serves as the single source of truth for API payloads. Both frontend and backend reference these types, preventing drift and ensuring type safety across the stack.

### 4. Date Handling Strategy
- All-day events use UTC midnight boundaries (00:00 UTC to 00:00 UTC next day)
- Timed events use local timezone for user input, converted to ISO strings for storage
- Date comparisons normalize to date-only components for all-day events

### 5. No External Modal Library
The modal is built with plain React and Tailwind CSS. This keeps the bundle size small and gives full control over behavior (focus trapping, escape key, accessibility).

### 6. SQLite for Development
SQLite provides zero-configuration local development. Prisma makes switching to PostgreSQL a single config change when needed.

## Known Limitations

- **No event deletion**: Delete functionality is not implemented (by design for v1)
- **No recurring events**: Each event is a single occurrence
- **No drag-and-drop**: Events must be edited via modal
- **No week/day views**: Only month view is implemented
- **No timezone selection**: Uses browser's local timezone
- **No user authentication**: Single-user application
- **No event descriptions UI**: Description field exists in the model but isn't displayed

## What I Would Build Next

If extending this project, I would prioritize:

1. **Event deletion** - Add delete button in edit modal
2. **Week and Day views** - Implement alternative calendar views
3. **Recurring events** - Support daily, weekly, monthly patterns
4. **Event search/filter** - Find events by title or category
5. **User authentication** - Multi-user support with login
6. **Event reminders** - Notifications for upcoming events
7. **Drag-and-drop** - Move events between days
8. **Export/Import** - iCal format support
9. **Mobile app** - React Native version
10. **Performance optimizations** - Virtual scrolling for large event lists

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- (Optional) PostgreSQL if you want to use it instead of SQLite

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Calendar
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed  # If seed script exists
   npm run dev
   ```
   Backend runs on `http://localhost:4000`

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

4. **Access the app**
   Open `http://localhost:5173` in your browser

### Development Scripts

**Backend:**
- `npm run dev` - Start development server
- `npm run db:setup` - Run Prisma migrations
- `npm run db:studio` - Open Prisma Studio

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
Calendar/
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── validation/ # Zod schemas
│   │   └── db/        # Prisma client
│   └── prisma/        # Database schema
├── frontend/          # React application
│   └── src/
│       ├── components/ # React components
│       └── api.ts     # API client helpers
├── shared/            # Shared TypeScript types
│   └── api-types.ts   # API contract definitions
└── docs/              # Architecture documentation
```

## API Endpoints

- `GET /api/categories` - List all categories
- `GET /api/events?from=ISO&to=ISO` - Get events in date range
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update existing event

All endpoints return JSON and use ISO 8601 datetime strings.

## License

MIT