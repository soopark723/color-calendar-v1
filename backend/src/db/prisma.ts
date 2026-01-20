import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient is expensive to create. In production we'd usually have 1 instance
 * per process. In dev with hot reload, we also want to avoid creating many.
 */
export const prisma = new PrismaClient();

