import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient singleton to prevent multiple instances during hot reload.
 * In production: 1 instance per process
 * In development: Reuse instance across hot reloads
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}