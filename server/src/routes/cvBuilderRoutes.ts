import { Router } from "express";
import { deleteCvbuilder, getCvbuilderlist, getCvbulderListByid, saveCvbuilder, updateCvbuilder } from "../controllers/cvBuilderController.js";
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticateToken as any, getCvbuilderlist as any);
router.post("/create", authenticateToken as any, saveCvbuilder as any);
router.put("/update/:id", authenticateToken as any, updateCvbuilder as any);
router.delete("/delete/:id", authenticateToken as any, deleteCvbuilder as any);
router.get("/:id", authenticateToken as any, getCvbulderListByid as any);

export default router;
