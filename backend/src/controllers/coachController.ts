import { Request, Response } from "express";
import { getCoachClients } from "../services/coachService";

export const getClients = async (req: Request, res: Response) => {
  try {
    const coachId = (req as any).user.id;
    const clients = await getCoachClients(coachId);
    res.status(200).json(clients);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch clients" });
  }
};