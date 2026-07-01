import { Router } from "express";
import { getClients } from "../controllers/coachController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/clients", protect, getClients);

export default router;