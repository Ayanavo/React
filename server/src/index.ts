// src/index.ts
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";

import dotenv from "dotenv";
import admin from "firebase-admin";
import activityRoutes from "./routes/activityRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./utils/db.js";
import i18n from "./utils/i18n.js";
import aiRoutes from "./routes/aitRoutes.js";
import { errorLogger, logger } from "./utils/logger.js";

const app = express();
dotenv.config();

/** --- Env & config --- */
const PORT = Number(process.env.PORT) || 5000;
const IS_PROD = process.env.NODE_ENV === "production";
const PROD_URL = (process.env.DOMAIN_NAME || "").trim();
const FRONTEND_URL = process.env.FRONTEND_URL?.trim();
const DEV_URLS = ["http://localhost:3000", "http://localhost:5173"];

/** --- DB connect before starting server --- */
connectDB();

/** --- Trust proxy (needed for secure cookies behind Render’s proxy) --- */
app.set("trust proxy", 1);

/** --- CORS setup (must be BEFORE routes) --- */
const allowlist: string[] = IS_PROD ? ([FRONTEND_URL, PROD_URL, "https://ayanavo.github.io"].filter(Boolean) as string[]) : DEV_URLS;

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (!origin || allowlist.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true, // set true only if you use cookies; fine here since cookie-parser is used
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // maxAge: 600, // optional: cache preflight for 10 minutes
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Global preflight handler

/** --- Core middleware --- */
app.use(cookieParser());
// You can use express.json(); keeping bodyParser.json() to match your existing setup
app.use(bodyParser.json());

/** --- i18n & logging --- */
app.use(i18n.init);
app.use(logger);
app.use(errorLogger);

/** --- Tiny request logger to confirm Origin/path in Render logs (optional) --- */
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Origin=${req.headers.origin || "-"}`);
  next();
});

/** --- Locale handler via query param: ?lang=bn (safe-typed) --- */
app.use((req: Request, _res: Response, next: NextFunction) => {
  const lang = req.query.lang as string | undefined;
  const setLocale = (req as any).setLocale;
  if (lang && typeof setLocale === "function") setLocale.call(req, lang);
  next();
});

app.get("/", (_req, res) => {
  const url = IS_PROD ? PROD_URL || "https://localhost" : `http://localhost:${PORT}`;
  res.send(`✅ Server is running at ${url}`);
});

//firebase auth
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/** --- Routes --- */
app.use("/api/activities", activityRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/ai", aiRoutes);

/** --- Start server (bind 0.0.0.0 on Render) --- */
app.listen(PORT, "0.0.0.0", () => {
  const url = IS_PROD ? PROD_URL || `http://0.0.0.0:${PORT}` : `http://localhost:${PORT}`;
  console.log(`✅ Server running at ${url}`);
});
