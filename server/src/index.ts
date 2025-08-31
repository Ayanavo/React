import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import express, { Request, Response } from "express";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./utils/db.js";
import cookieParser from "cookie-parser";
import i18n from "./utils/i18n.js";
import { errorLogger, logger } from "./utils/logger.js";

const app = express();

// --- Config ---
const PORT = Number(process.env.PORT) || 5000;
const IS_PROD = process.env.NODE_ENV == "production";
const PROD_URL = process.env.DOMAIN_NAME;
// For dev environment, fallback to localhost
const DEV_URLS = ["http://localhost:3000", "http://localhost:5173"];

// --- Connect to MongoDB ---
connectDB();

// --- Middleware ---
app.use(
  cors({
    origin: IS_PROD ? PROD_URL : DEV_URLS,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(i18n.init);
app.use(logger);
app.use(errorLogger);

// --- Locale handler ---
app.use((req: Request, _res: Response, next: () => void) => {
  const lang = req.query.lang as string;
  if (lang) req.setLocale(lang);
  next();
});

// --- Routes ---
app.get("/", (_req, res) => {
  res.send(`✅ Server is running at ${IS_PROD ? PROD_URL : `http://localhost:${PORT}`}`);
});

app.use("/api/activities", activityRoutes);
app.use("/api/auth", userRoutes);

// --- Start server ---
// Always bind to 0.0.0.0 on Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at ${IS_PROD ? PROD_URL : `http://localhost:${PORT}`}`);
});
