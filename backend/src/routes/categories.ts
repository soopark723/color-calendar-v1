import { Router } from "express";
import { prisma } from "../db/prisma";
import { createCategoryBodySchema } from "../validation/categories";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json({ categories });
});

categoriesRouter.post("/", async (req, res) => {
  const parsed = createCategoryBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  const created = await prisma.category.create({ data: parsed.data });
  res.status(201).json({ category: created });
});

