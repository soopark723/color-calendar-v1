import { z } from "zod";

export const createCategoryBodySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "color must be a 6-digit hex like #3b82f6")
});

export const updateCategoryBodySchema = createCategoryBodySchema.partial(); 