import { Router } from "express";
import { addClientToCoach, getClients } from "../controllers/coachController";
import { protect } from "../middleware/authMiddleware";

const router = Router();


router.get("/clients", protect, getClients);
router.post("/clients", protect, addClientToCoach);

export default router;