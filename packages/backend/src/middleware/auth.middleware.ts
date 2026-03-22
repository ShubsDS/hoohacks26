import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as { sub: string; isAdmin: boolean };
    req.userId = payload.sub;
    req.isAdmin = payload.isAdmin ?? false;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
