import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import {
  submitCheckIn,
  getCheckIns,
  getCurrentWeekStatus,
  getClientMetricsController
} from "../controllers/clientController";

const router = Router();

router.use(protect);
router.use(requireRole("CLIENT"));

router.post("/check-in", submitCheckIn);
router.get("/check-ins", getCheckIns);
router.get("/current-week", getCurrentWeekStatus);
router.get("/metrics", getClientMetricsController);

export default router;
