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
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.DOMAIN_NAME || "0.0.0.0";

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? [process.env.CLIENT_URL || ""] : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(i18n.init);
app.use(logger);
app.use(errorLogger);

app.use((req: Request, _res: Response, next: () => void) => {
  const lang = req.query.lang as string;
  if (lang) req.setLocale(lang); // Set the locale dynamicall
  next();
});

app.get("/", (req: any, res: { send: (arg0: string) => void }) => {
  res.send(`Server is running on http://${HOST}:${PORT}`);
});

// Use the /api/activities route
app.use("/api/activities", activityRoutes);

// Use the auth routes
app.use("/api/auth", userRoutes);

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

// serverlessHttp(app);
