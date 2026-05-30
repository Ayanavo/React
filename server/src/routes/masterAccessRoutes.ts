import { Router } from "express";
import { deleteUser, getPermissions, getPermissionsByToken, getUsers, savePermissions } from "../controllers/masterAccessController.js";

const router = Router();

router.get("/users", getUsers);
router.delete("/delete/:id", deleteUser);
router.get("/permissions/:userId", getPermissions);
router.post("/save", savePermissions);
router.post("/permissionsAuth", getPermissionsByToken);

export default router;
