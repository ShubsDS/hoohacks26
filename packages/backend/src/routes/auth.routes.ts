import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'email, password, and displayName are required' });
  }
  if (!email.endsWith('@virginia.edu')) {
    return res.status(400).json({ error: 'Must use a @virginia.edu email address' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, displayName, passwordHash },
    });
    const token = jwt.sign(
      { sub: user.id, isAdmin: user.isAdmin },
      env.SUPABASE_JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(201).json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, credibilityScore: user.credibilityScore, isAdmin: user.isAdmin } });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { sub: user.id, isAdmin: user.isAdmin },
      env.SUPABASE_JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, credibilityScore: user.credibilityScore, isAdmin: user.isAdmin } });
  } catch {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, displayName: true, credibilityScore: true, isAdmin: true, totalReports: true, confirmedReports: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/auth/push-token
router.post('/push-token', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token is required' });
  try {
    await prisma.user.update({ where: { id: req.userId }, data: { expoPushToken: token } });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to save push token' });
  }
});

export default router;
