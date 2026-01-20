import { Router } from "express";
import { prisma } from "../db/prisma";
import { createEventBodySchema, updateEventBodySchema } from "../validation/events";

export const eventsRouter = Router();

/**
 * GET /api/events?from=ISO&to=ISO
 * Returns events that overlap the range [from, to).
 */
eventsRouter.get("/", async (req, res) => {
  const from = typeof req.query.from === "string" ? new Date(req.query.from) : null;
  const to = typeof req.query.to === "string" ? new Date(req.query.to) : null;

  // If no range is provided, return a small default window (useful in early dev).
  const now = new Date();
  const fromEff = from ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const toEff = to ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const events = await prisma.event.findMany({
    where: {
      // Overlap condition: start < to AND end > from
      startAt: { lt: toEff },
      endAt: { gt: fromEff }
    },
    orderBy: { startAt: "asc" }
  });

  res.json({ events });
});

eventsRouter.post("/", async (req, res) => {
  const parsed = createEventBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const created = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      allDay: data.allDay ?? false,
      categoryId: data.categoryId ?? null
    }
  });

  res.status(201).json({ event: created });
});

eventsRouter.put("/:id", async (req, res) => {
  const parsed = updateEventBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  const { id } = req.params;
  const data = parsed.data;

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description ?? null } : {}),
      ...(data.startAt !== undefined ? { startAt: new Date(data.startAt) } : {}),
      ...(data.endAt !== undefined ? { endAt: new Date(data.endAt) } : {}),
      ...(data.allDay !== undefined ? { allDay: data.allDay } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {})
    }
  });

  res.json({ event: updated });
});

eventsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.event.delete({ where: { id } });
  res.status(204).send();
});

