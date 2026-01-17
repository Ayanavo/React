import { Router } from "express";
import { getAdressfromLatLng, getStateList, validatePincode } from "../controllers/settings.Controller.js";
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.post("/getCurrentLocation", authenticateToken as any, getAdressfromLatLng as any);
router.get("/getStateList", authenticateToken as any, getStateList as any);
router.post("/validatePincode", authenticateToken as any, validatePincode as any);

export default router;
