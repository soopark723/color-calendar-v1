import { Router } from "express";
import { prisma } from "../db/prisma";
import { 
  createEventBodySchema, 
  updateEventBodySchema,
  getEventsQuerySchema 
} from "../validation/events";

export const eventsRouter = Router();

// GET /api/events?from=ISO&to=ISO - List events in date range
eventsRouter.get("/", async (req, res) => {
  const queryParsed = getEventsQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({ 
      error: "Invalid query parameters", 
      details: queryParsed.error.flatten() 
    });
  }

  const { from, to } = queryParsed.data;

  // Default to current month if no range provided
  const now = new Date();
  const fromEff = from 
    ? new Date(from) 
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const toEff = to 
    ? new Date(to) 
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  try {
    const events = await prisma.event.findMany({
      where: {
        // Overlap condition: event starts before range ends AND event ends after range starts
        startAt: { lt: toEff },
        endAt: { gt: fromEff }
      },
      include: {
        category: true // Include category with color
      },
      orderBy: { startAt: "asc" }
    });

    res.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// POST /api/events - Create new event
eventsRouter.post("/", async (req, res) => {
  const parsed = createEventBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      error: "Invalid request body", 
      details: parsed.error.flatten() 
    });
  }

  const data = parsed.data;

  try {
    // Validate category exists if provided
    if (data.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });
      if (!categoryExists) {
        return res.status(400).json({ error: "Category not found" });
      }
    }

    const created = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        allDay: data.allDay ?? false,
        categoryId: data.categoryId ?? null
      },
      include: {
        category: true
      }
    });

    res.status(201).json({ event: created });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// GET /api/events/:id - Get single event
eventsRouter.get("/:id", async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ event });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// PATCH /api/events/:id - Update event
eventsRouter.patch("/:id", async (req, res) => {
  const parsed = updateEventBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      error: "Invalid request body", 
      details: parsed.error.flatten() 
    });
  }

  const { id } = req.params;
  const data = parsed.data;

  try {
    // Check if event exists
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Validate category if being updated
    if (data.categoryId !== undefined && data.categoryId !== null) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });
      if (!categoryExists) {
        return res.status(400).json({ error: "Category not found" });
      }
    }

    // Build update object
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startAt !== undefined) updateData.startAt = new Date(data.startAt);
    if (data.endAt !== undefined) updateData.endAt = new Date(data.endAt);
    if (data.allDay !== undefined) updateData.allDay = data.allDay;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });

    res.json({ event: updated });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// DELETE /api/events/:id - Delete event
eventsRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(404).json({ error: "Event not found" });
  }
});