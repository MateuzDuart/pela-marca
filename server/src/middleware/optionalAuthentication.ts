import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: string;
}

export function optionalAuthentication(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.Authorization;

  if (!token) {
    // Não autenticado, mas permitido
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    (req as any).userId = decoded.userId;
  } catch (err) {
    console.warn("Token inválido ou expirado, ignorando auth");
    // Apenas ignora o token inválido
  }

  next();
}
