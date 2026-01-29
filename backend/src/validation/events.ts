import { z } from "zod";

// Base schema without refinements
const baseEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  allDay: z.boolean().optional(),
  categoryId: z.string().uuid().nullable().optional()
});

// Create schema WITH date validation
export const createEventBodySchema = baseEventSchema.superRefine((v, ctx) => {
  const start = new Date(v.startAt);
  const end = new Date(v.endAt);
  if (!(end > start)) {
    ctx.addIssue({
      code: "custom",
      path: ["endAt"],
      message: "endAt must be after startAt"
    });
  }
});

// Update schema - make base schema partial, THEN add refinement
export const updateEventBodySchema = baseEventSchema.partial().superRefine((v, ctx) => {
  // Only validate dates if BOTH are provided
  if (v.startAt && v.endAt) {
    const start = new Date(v.startAt);
    const end = new Date(v.endAt);
    if (!(end > start)) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "endAt must be after startAt"
      });
    }
  }
});

// Query params validation for GET /api/events
export const getEventsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});