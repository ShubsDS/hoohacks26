import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { prisma } from '../config/database';
import { getIO } from '../config/socket';
import { getIntersectingCells } from '../socket/rooms';
import { sendToUsers } from '../services/notification.service';
import { getUsersInRadius } from '../services/geo.service';

const router = Router();
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users
router.get('/users', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, displayName: true, credibilityScore: true, totalReports: true, confirmedReports: true, isAdmin: true, createdAt: true, expoPushToken: true, location: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/reports
router.get('/reports', async (req: AuthRequest, res: Response) => {
  const { status, category } = req.query;
  try {
    const reports = await prisma.report.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(category ? { category: category as any } : {}),
      },
      include: { reporter: { select: { displayName: true, credibilityScore: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(reports);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PATCH /api/admin/reports/:id
router.patch('/reports/:id', async (req: AuthRequest, res: Response) => {
  const { status, adminNote } = req.body;
  try {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        ...(status ? { status, adminVerified: status === 'ADMIN_VERIFIED' } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
        ...(status === 'RESOLVED' ? { resolvedAt: new Date() } : {}),
      },
      include: { reporter: { select: { displayName: true, credibilityScore: true } } },
    });

    const io = getIO();
    const cells = getIntersectingCells(report.latitude, report.longitude, report.radiusMeters);
    for (const cell of cells) {
      io.to(`geo:${cell}`).emit('report:updated', report);
    }
    io.to('admin:dashboard').emit('report:updated', report);

    return res.json(report);
  } catch {
    return res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE /api/admin/reports/:id
router.delete('/reports/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.reportConfirmation.deleteMany({ where: { reportId: req.params.id } });
    await prisma.report.delete({ where: { id: req.params.id } });

    const io = getIO();
    io.to('admin:dashboard').emit('report:resolved', { reportId: req.params.id });

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to delete report' });
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
  const { credibilityScore, isAdmin } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(credibilityScore !== undefined ? { credibilityScore } : {}),
        ...(isAdmin !== undefined ? { isAdmin } : {}),
      },
      select: { id: true, email: true, displayName: true, credibilityScore: true, isAdmin: true },
    });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// POST /api/admin/broadcast
router.post('/broadcast', async (req: AuthRequest, res: Response) => {
  const { message, severity, lat, lng, radiusMeters } = req.body;
  if (!message || !severity) {
    return res.status(400).json({ error: 'message and severity are required' });
  }
  try {
    const io = getIO();
    const broadcastPayload = { message, severity };

    if (lat !== undefined && lng !== undefined && radiusMeters) {
      // Target specific area
      const cells = getIntersectingCells(lat, lng, radiusMeters);
      for (const cell of cells) {
        io.to(`geo:${cell}`).emit('admin:broadcast', broadcastPayload);
      }
      const userIds = await getUsersInRadius(lat, lng, radiusMeters);
      await sendToUsers(userIds, { title: 'UVA Alert', body: message, data: {} });
    } else {
      // Broadcast to all
      io.emit('admin:broadcast', broadcastPayload);
      const allUsers = await prisma.user.findMany({
        where: { expoPushToken: { not: null } },
        select: { id: true },
      });
      await sendToUsers(allUsers.map(u => u.id), { title: 'UVA Alert', body: message, data: {} });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// GET /api/admin/stats
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const startOfDay = new Date(new Date(now).setHours(0, 0, 0, 0));

    const [activeCount, criticalCount, lastHourCount, todayConfirmations, totalUsers, emergencyReports, resolvedToday] = await Promise.all([
      prisma.report.count({ where: { status: 'ACTIVE' } }),
      prisma.report.count({ where: { status: 'ACTIVE', severity: { in: ['HIGH', 'CRITICAL'] } } }),
      prisma.report.count({ where: { createdAt: { gte: oneHourAgo } } }),
      prisma.reportConfirmation.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.user.count(),
      prisma.report.findMany({ where: { status: 'ACTIVE', category: 'EMERGENCY' }, select: { latitude: true, longitude: true, radiusMeters: true } }),
      prisma.report.count({ where: { resolvedAt: { gte: startOfDay } } }),
    ]);

    const emergencyCount = emergencyReports.length;

    // Compute unique users in danger zones across all active emergency reports
    const allUserIds = new Set<string>();
    for (const report of emergencyReports) {
      const userIds = await getUsersInRadius(report.latitude, report.longitude, report.radiusMeters);
      for (const id of userIds) allUserIds.add(id);
    }
    const usersInDangerZone = allUserIds.size;

    return res.json({ activeCount, criticalCount, lastHourCount, todayConfirmations, totalUsers, emergencyCount, usersInDangerZone, resolvedToday });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
