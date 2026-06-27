import { RequestHandler, Router } from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const router = Router();
const publicAssetsDir = join(dirname(fileURLToPath(import.meta.url)), "../assets");

router.get("/app-icon-email.svg", ((_req, res) => {
  res.type("image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.sendFile(join(publicAssetsDir, "app-icon-email.svg"));
}) as RequestHandler);

export default router;
