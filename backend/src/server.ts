import express from "express";
import cors from "cors";
import { categoriesRouter } from "./routes/categories";
import { eventsRouter } from "./routes/events";
import { prisma } from "./db/prisma";

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL 
    : "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/categories", categoriesRouter);
app.use("/api/events", eventsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`\n🚀 Calendar API Server Started`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 Server:      http://localhost:${port}`);
  console.log(`💚 Health:      http://localhost:${port}/api/health`);
  console.log(`🎨 Categories:  http://localhost:${port}/api/categories`);
  console.log(`📅 Events:      http://localhost:${port}/api/events`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  
  server.close(() => {
    console.log("✅ HTTP server closed");
  });

  await prisma.$disconnect();
  console.log("✅ Database connection closed");
  
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);