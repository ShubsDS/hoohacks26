import { prisma } from '../config/database';

export async function getUsersInRadius(lat: number, lng: number, radiusMeters: number): Promise<string[]> {
  const result = await prisma.$queryRaw<{ userId: string }[]>`
    SELECT "userId"
    FROM "UserLocation"
    WHERE ST_DWithin(
      geom::geography,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
      ${radiusMeters}
    )
  `;
  return result.map(r => r.userId);
}

export async function getReportsInRadius(lat: number, lng: number, radiusMeters: number) {
  const result = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM "Report"
    WHERE status = 'ACTIVE'
      AND "expiresAt" > NOW()
      AND ST_DWithin(
        geom::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
  `;
  const ids = result.map(r => r.id);
  if (ids.length === 0) return [];

  return prisma.report.findMany({
    where: { id: { in: ids } },
    include: { reporter: { select: { displayName: true, credibilityScore: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
