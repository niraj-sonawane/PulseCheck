import { Router } from "express";
import { addClientToCoach, getClients, getClientProfile } from "../controllers/coachController";
import { protect } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { validateUuidParam } from "../middleware/uuidMiddleware";

const router = Router();

router.get("/clients", protect, requireRole("COACH"), getClients);
router.post("/clients", protect, requireRole("COACH"), addClientToCoach);
router.get("/clients/:clientId", protect, requireRole("COACH"), validateUuidParam("clientId"), getClientProfile);

export default router;