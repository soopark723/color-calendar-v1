import { Router } from "express";
import { prisma } from "../db/prisma";
import { createCategoryBodySchema, updateCategoryBodySchema } from "../validation/categories";

export const categoriesRouter = Router();

// GET /api/categories - List all categories
categoriesRouter.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({ 
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { events: true }
        }
      }
    });
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST /api/categories - Create new category
categoriesRouter.post("/", async (req, res) => {
  const parsed = createCategoryBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      error: "Invalid request body", 
      details: parsed.error.flatten() 
    });
  }

  try {
    const created = await prisma.category.create({ 
      data: parsed.data 
    });
    res.status(201).json({ category: created });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// GET /api/categories/:id - Get single category
categoriesRouter.get("/:id", async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { 
        events: {
          orderBy: { startAt: "asc" }
        }
      }
    });
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// PATCH /api/categories/:id - Update category
categoriesRouter.patch("/:id", async (req, res) => {
  const parsed = updateCategoryBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      error: "Invalid request body", 
      details: parsed.error.flatten() 
    });
  }

  try {
    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: parsed.data
    });
    res.json({ category: updated });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(404).json({ error: "Category not found" });
  }
});

// DELETE /api/categories/:id - Delete category
categoriesRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(404).json({ error: "Category not found" });
  }
});