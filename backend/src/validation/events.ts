import { z } from "zod";

// Use ISO strings on the wire; convert to Date in the backend before DB calls.
export const createEventBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  allDay: z.boolean().optional(),
  categoryId: z.string().uuid().nullable().optional()
}).superRefine((v, ctx) => {
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

export const updateEventBodySchema = createEventBodySchema.partial();

