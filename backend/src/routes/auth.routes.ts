import { Router } from "express";
import {
  loginAdmin,
  registerAdmin,
  getCurrentAdmin,
  logoutAdmin,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.get("/me", authMiddleware, getCurrentAdmin);
router.post("/logout", authMiddleware, logoutAdmin);

export default router;
