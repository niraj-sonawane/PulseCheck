import { Request, Response, NextFunction } from "express";

export const validateUuidParam = (paramName: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return (req: Request, res: Response, next: NextFunction) => {
    const val = req.params[paramName];
    if (typeof val !== "string" || !uuidRegex.test(val)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format. Expected a valid UUID.`
      });
    }
    next();
  };
};
