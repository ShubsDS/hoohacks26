import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
