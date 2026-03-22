import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { getIO } from '../config/socket';
import { getReportsInRadius } from '../services/geo.service';
import { updateCredibility } from '../services/credibility.service';
import { getGridCell, getIntersectingCells } from '../socket/rooms';

const router = Router();

const EXPIRY_HOURS: Record<string, number> = {
  EMERGENCY: 6,
  CRIME: 24,
  INFRASTRUCTURE: 48,
  WEATHER: 24,
  PROTEST: 12,
  OTHER: 48,
};

// GET /api/reports/nearby
router.get('/nearby', authMiddleware, async (req: AuthRequest, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radius = parseFloat(req.query.radius as string) || 2000;
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }
  try {
    const reports = await getReportsInRadius(lat, lng, radius);
    return res.json(reports);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/reports
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { category, severity, title, description, lat, lng, radiusMeters } = req.body;
  if (!category || !title || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'category, title, lat, lng are required' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hoursUntilExpiry = EXPIRY_HOURS[category] ?? 24;
    const expiresAt = new Date(Date.now() + hoursUntilExpiry * 60 * 60 * 1000);

    const report = await prisma.report.create({
      data: {
        reporterId: req.userId!,
        category,
        severity: severity ?? 'MEDIUM',
        title,
        description,
        latitude: lat,
        longitude: lng,
        radiusMeters: radiusMeters ?? 500,
        credibilityWeight: user.credibilityScore,
        expiresAt,
      },
      include: { reporter: { select: { displayName: true, credibilityScore: true } } },
    });

    await prisma.user.update({ where: { id: req.userId }, data: { totalReports: { increment: 1 } } });

    // Broadcast via socket to nearby rooms
    const io = getIO();
    const cells = getIntersectingCells(lat, lng, radiusMeters ?? 500);
    for (const cell of cells) {
      io.to(`geo:${cell}`).emit('report:new', report);
    }
    io.to('admin:dashboard').emit('report:new', report);

    return res.status(201).json(report);
  } catch {
    return res.status(500).json({ error: 'Failed to create report' });
  }
});

// POST /api/reports/:id/confirm
router.post('/:id/confirm', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.reporterId === req.userId) {
      return res.status(400).json({ error: 'Cannot confirm your own report' });
    }

    await prisma.reportConfirmation.create({
      data: { reportId: req.params.id, userId: req.userId! },
    });

    const updated = await prisma.report.update({
      where: { id: req.params.id },
      data: { confirmationCount: { increment: 1 } },
      include: { reporter: { select: { displayName: true, credibilityScore: true } } },
    });

    await updateCredibility(report.reporterId, 'confirm');
    await prisma.user.update({ where: { id: report.reporterId }, data: { confirmedReports: { increment: 1 } } });

    const io = getIO();
    const cells = getIntersectingCells(report.latitude, report.longitude, report.radiusMeters);
    for (const cell of cells) {
      io.to(`geo:${cell}`).emit('report:updated', updated);
    }
    io.to('admin:dashboard').emit('report:updated', updated);

    return res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Already confirmed this report' });
    }
    return res.status(500).json({ error: 'Failed to confirm report' });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.reporterId !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this report' });
    }
    await prisma.report.delete({ where: { id: req.params.id } });

    const io = getIO();
    const cells = getIntersectingCells(report.latitude, report.longitude, report.radiusMeters);
    for (const cell of cells) {
      io.to(`geo:${cell}`).emit('report:resolved', { reportId: req.params.id });
    }
    io.to('admin:dashboard').emit('report:resolved', { reportId: req.params.id });

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
