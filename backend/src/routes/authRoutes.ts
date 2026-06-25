import { Router } from "express";
import { login, logout, me, register } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);


router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", logout);

export default router; 