import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Access denied" });

  const tokenSplited = authHeader.split("Bearer ");
  const token = tokenSplited[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "KEY_TOKEN",
    ) as { userId: string };

    (req as any).userId = decoded.userId;

    return next();
  } catch {
    return res.status(401).json({ error: "Access denied" });
  }
};
