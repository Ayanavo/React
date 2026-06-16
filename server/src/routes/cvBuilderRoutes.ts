import { Router } from "express";
import { checkAtsScore } from "../controllers/atsController.js";
import { getCvTemplateById, getCvTemplates } from "../controllers/cvTemplateController.js";
import { deleteCvbuilder, getAddressSuggestions, getCvbuilderlist, getCvbulderListByid, saveCvbuilder, updateCvbuilder } from "../controllers/cvBuilderController.js";
import { authenticateToken } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticateToken as any, getCvbuilderlist as any);
router.get("/address-suggestions", authenticateToken as any, getAddressSuggestions as any);
router.get("/templates", authenticateToken as any, getCvTemplates as any);
router.get("/templates/:templateId", authenticateToken as any, getCvTemplateById as any);
router.post("/ats-check", authenticateToken as any, checkAtsScore as any);
router.post("/create", authenticateToken as any, saveCvbuilder as any);
router.put("/update/:id", authenticateToken as any, updateCvbuilder as any);
router.delete("/delete/:id", authenticateToken as any, deleteCvbuilder as any);
router.get("/:id([0-9a-fA-F]{24})", authenticateToken as any, getCvbulderListByid as any);

export default router;
