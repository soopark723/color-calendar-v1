import { z } from "zod";

// Keep color as a hex string so the UI can use it directly.
export const createCategoryBodySchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "color must be a 6-digit hex like #3b82f6")
});

