import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import i18n from "./utils/i18n.js";
import bodyParser from "body-parser";
import connectDB from "./utils/db.js";
import activityRoutes from "./routes/activityRoutes.js";
import serverlessHttp from "serverless-http";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(i18n.init);

app.use((req: Request, _res: Response, next: () => void) => {
  const lang = req.query.lang as string;
  if (lang) req.setLocale(lang); // Set the locale dynamicall
  next();
});

// Use the /api/activities route
// app.use("/api/activities", activityRoutes);
app.use("/.netlify/functions/api/activities", activityRoutes);

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

serverlessHttp(app);
