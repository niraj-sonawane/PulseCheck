import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export const requireRole = (role: "COACH" | "CLIENT") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      if (user.role !== role) {
        return res.status(403).json({ success: false, message: "Forbidden: role mismatch" });
      }

      next();
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "Authorization check failed" });
    }
  };
};
