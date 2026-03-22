import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_USERS = [
  { email: 'admin@virginia.edu', displayName: 'Admin', password: 'password', isAdmin: true, credibilityScore: 3.0 },
  { email: 'will@virginia.edu', displayName: 'Will', password: 'password', isAdmin: false, credibilityScore: 2.1 },
  { email: 'amith@virginia.edu', displayName: 'Amith', password: 'password', isAdmin: false, credibilityScore: 1.5 },
  { email: 'eric@virginia.edu', displayName: 'Eric', password: 'password', isAdmin: false, credibilityScore: 1.8 },
];

const EXPIRY_HOURS: Record<string, number> = {
  EMERGENCY: 6,
  CRIME: 24,
  INFRASTRUCTURE: 48,
  WEATHER: 24,
  PROTEST: 12,
  OTHER: 48,
};

const DEMO_REPORTS = [
  { title: 'Suspicious person near AFC', category: 'CRIME' as const, severity: 'HIGH' as const, lat: 38.0321, lng: -78.5092, radiusMeters: 100 },
  { title: 'Large gathering blocking JPA', category: 'PROTEST' as const, severity: 'LOW' as const, lat: 38.0298, lng: -78.5145, radiusMeters: 200 },
  { title: 'Medical emergency at Newcomb', category: 'EMERGENCY' as const, severity: 'CRITICAL' as const, lat: 38.0355, lng: -78.5036, radiusMeters: 50 },
  { title: 'Flash flood warning near Dell', category: 'WEATHER' as const, severity: 'LOW' as const, lat: 38.0345, lng: -78.5055, radiusMeters: 300 },
  { title: 'Car break-in on Grady Ave', category: 'CRIME' as const, severity: 'MEDIUM' as const, lat: 38.0390, lng: -78.5100, radiusMeters: 25 },
];

async function seed() {
  console.log('Cleaning existing data...');
  await prisma.reportConfirmation.deleteMany();
  await prisma.report.deleteMany();
  console.log('All reports removed.');

  console.log('Seeding database...');

  // Create all users
  const users = [];
  for (const u of SEED_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        displayName: u.displayName,
        passwordHash,
        isAdmin: u.isAdmin,
        credibilityScore: u.credibilityScore,
      },
    });
    console.log(`Created user: ${user.email} (id: ${user.id}, admin: ${u.isAdmin})`);
    users.push(user);
  }

  // Distribute reports across users (round-robin)
  const reportCounts: Record<string, number> = {};
  for (const user of users) {
    reportCounts[user.id] = 0;
  }

  for (let i = 0; i < DEMO_REPORTS.length; i++) {
    const report = DEMO_REPORTS[i];
    const assignedUser = users[i % users.length];
    const hoursUntilExpiry = EXPIRY_HOURS[report.category] ?? 24;
    const expiresAt = new Date(Date.now() + hoursUntilExpiry * 60 * 60 * 1000);

    const created = await prisma.report.create({
      data: {
        reporterId: assignedUser.id,
        category: report.category,
        severity: report.severity,
        title: report.title,
        latitude: report.lat,
        longitude: report.lng,
        radiusMeters: report.radiusMeters,
        credibilityWeight: assignedUser.credibilityScore,
        expiresAt,
      },
    });
    reportCounts[assignedUser.id]++;
    console.log(`Created report: "${created.title}" (by ${assignedUser.displayName})`);
  }

  // Update totalReports for each user
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { totalReports: reportCounts[user.id] },
    });
  }

  console.log(`\nSeed complete! ${DEMO_REPORTS.length} reports created.`);
  console.log(`\nCredentials (all use password "password"):`);
  for (const u of SEED_USERS) {
    console.log(`  ${u.isAdmin ? 'Admin' : 'User'}:  ${u.email}`);
  }
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
