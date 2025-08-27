// server/server.js (ESM)
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

const app = createApp();

// Kick off the DB connection once (cold start on Vercel reuses it)
const connectPromise = connectDB(process.env.MONGO_URI);

// ---- Local dev: run `node server/server.js` or `npm run dev` ----
const isRunDirectly = import.meta.url === `file://${process.argv[1]}`;
if (!process.env.VERCEL && isRunDirectly) {
  const PORT = process.env.PORT || 5000;
  connectPromise.then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 API running on http://localhost:${PORT}`)
    );
  });
}

// ---- Vercel: export a handler (no .listen()) ----
export default async function handler(req, res) {
  await connectPromise; // ensure DB is ready for each invocation
  return app(req, res); // delegate to Express
}
