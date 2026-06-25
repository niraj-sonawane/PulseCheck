import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    (req as any).user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};