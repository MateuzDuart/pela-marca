import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.Authorization;

  if (!token) {
    res.status(401).json({ message: "Token não encontrado no cookie" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    (req as any).userId = decoded.userId;

    next();
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
}
