import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

// POST /api/location/update
router.post('/update', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { lat, lng } = req.body;
  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }
  try {
    await prisma.userLocation.upsert({
      where: { userId: req.userId },
      update: { latitude: lat, longitude: lng },
      create: { userId: req.userId!, latitude: lat, longitude: lng },
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE /api/location
router.delete('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.userLocation.deleteMany({ where: { userId: req.userId } });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;
