import { Request, Response } from "express";
import {
  findClientProfileByUserId,
  createCheckIn,
  getClientCheckIns,
  getClientMetrics,
  hasSubmittedThisWeek
} from "../services/clientService";

export const submitCheckIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token."
      });
    }

    const clientProfile = await findClientProfileByUserId(userId);
    const checkIn = await createCheckIn(clientProfile.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Check-in submitted successfully.",
      data: checkIn
    });
  } catch (error: any) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to submit check-in."
    });
  }
};

export const getCheckIns = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token."
      });
    }

    const clientProfile = await findClientProfileByUserId(userId);
    const history = await getClientCheckIns(clientProfile.id);

    return res.status(200).json({
      success: true,
      message: "History retrieved successfully.",
      data: history
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to retrieve history."
    });
  }
};

export const getCurrentWeekStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token."
      });
    }

    const clientProfile = await findClientProfileByUserId(userId);
    const submitted = await hasSubmittedThisWeek(clientProfile.id);

    return res.status(200).json({
      success: true,
      message: "Status checked successfully.",
      data: { submitted }
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to check status."
    });
  }
};

export const getClientMetricsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token."
      });
    }

    const clientProfile = await findClientProfileByUserId(userId);
    const metrics = await getClientMetrics(clientProfile.id);

    return res.status(200).json({
      success: true,
      message: "Metrics calculated successfully.",
      data: metrics
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to calculate metrics."
    });
  }
};
