import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_USER = {
  email: 'demo@virginia.edu',
  displayName: 'Demo User',
  password: 'password123',
};

const ADMIN_USER = {
  email: 'admin@virginia.edu',
  displayName: 'UVA Admin',
  password: 'admin123',
  isAdmin: true,
};

const EXPIRY_HOURS: Record<string, number> = {
  EMERGENCY: 6,
  CRIME: 24,
  INFRASTRUCTURE: 48,
  WEATHER: 24,
  PROTEST: 12,
  OTHER: 48,
};

const DEMO_REPORTS = [
  { title: 'Suspicious person near AFC', category: 'CRIME' as const, severity: 'HIGH' as const, lat: 38.0321, lng: -78.5092, radiusMeters: 300 },
  { title: 'Water main break on Alderman', category: 'INFRASTRUCTURE' as const, severity: 'MEDIUM' as const, lat: 38.0367, lng: -78.5024, radiusMeters: 500 },
  { title: 'Large gathering blocking JPA', category: 'PROTEST' as const, severity: 'LOW' as const, lat: 38.0298, lng: -78.5145, radiusMeters: 800 },
  { title: 'Black ice on Rugby Rd', category: 'WEATHER' as const, severity: 'MEDIUM' as const, lat: 38.0412, lng: -78.5068, radiusMeters: 600 },
  { title: 'Medical emergency at Newcomb', category: 'EMERGENCY' as const, severity: 'CRITICAL' as const, lat: 38.0355, lng: -78.5036, radiusMeters: 200 },
  { title: 'Broken streetlight on McCormick', category: 'INFRASTRUCTURE' as const, severity: 'LOW' as const, lat: 38.0330, lng: -78.5110, radiusMeters: 400 },
  { title: 'Flash flood warning near Dell', category: 'WEATHER' as const, severity: 'HIGH' as const, lat: 38.0345, lng: -78.5055, radiusMeters: 700 },
  { title: 'Car break-in on Grady Ave', category: 'CRIME' as const, severity: 'MEDIUM' as const, lat: 38.0390, lng: -78.5100, radiusMeters: 350 },
];

async function seed() {
  console.log('Seeding database...');

  // Create demo user
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: {
      email: DEMO_USER.email,
      displayName: DEMO_USER.displayName,
      passwordHash,
    },
  });
  console.log(`Created demo user: ${demoUser.email} (id: ${demoUser.id})`);

  // Create admin user
  const adminHash = await bcrypt.hash(ADMIN_USER.password, 12);
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_USER.email },
    update: {},
    create: {
      email: ADMIN_USER.email,
      displayName: ADMIN_USER.displayName,
      passwordHash: adminHash,
      isAdmin: true,
    },
  });
  console.log(`Created admin user: ${adminUser.email} (id: ${adminUser.id})`);

  // Create demo reports
  for (const report of DEMO_REPORTS) {
    const hoursUntilExpiry = EXPIRY_HOURS[report.category] ?? 24;
    const expiresAt = new Date(Date.now() + hoursUntilExpiry * 60 * 60 * 1000);

    const created = await prisma.report.create({
      data: {
        reporterId: demoUser.id,
        category: report.category,
        severity: report.severity,
        title: report.title,
        latitude: report.lat,
        longitude: report.lng,
        radiusMeters: report.radiusMeters,
        credibilityWeight: demoUser.credibilityScore,
        expiresAt,
      },
    });
    console.log(`Created report: "${created.title}"`);
  }

  // Update demo user totalReports
  await prisma.user.update({
    where: { id: demoUser.id },
    data: { totalReports: DEMO_REPORTS.length },
  });

  console.log(`\nSeed complete! ${DEMO_REPORTS.length} reports created.`);
  console.log(`\nDemo credentials:`);
  console.log(`  User:  ${DEMO_USER.email} / ${DEMO_USER.password}`);
  console.log(`  Admin: ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
