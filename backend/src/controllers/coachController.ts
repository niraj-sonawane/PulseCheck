import { Request, Response } from "express";
import { getCoachClients, addClient } from "../services/coachService";

export const getClients = async (req: Request, res: Response) => {
  try {
    const coachId = (req as any).user.id;
    const clients = await getCoachClients(coachId);
    res.status(200).json(clients);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch clients" });
  }
};

export const addClientToCoach = async (req: Request, res: Response) => {
  try {
    const coachId = (req as any).user.id;
    const { email } = req.body;
    const client = await addClient(coachId, email);
    res.status(201).json(client);
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to add client" });
  }
};