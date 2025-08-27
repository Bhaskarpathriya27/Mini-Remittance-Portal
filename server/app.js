import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import benRoutes from "./routes/beneficiaries.routes.js";
import txRoutes from "./routes/transactions.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import receiptsRoutes from "./routes/receipts.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.get("/api/health", (req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);
  app.use("/api/beneficiaries", benRoutes);
  app.use("/api/transactions", txRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/receipts", receiptsRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
export default createApp;
