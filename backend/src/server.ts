import express from "express";
import cors from "cors";
import { categoriesRouter } from "./routes/categories";
import { eventsRouter } from "./routes/events";

const app = express();

// In early dev we allow CORS broadly. For production, tighten to your known frontend origin(s).
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/categories", categoriesRouter);
app.use("/api/events", eventsRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

