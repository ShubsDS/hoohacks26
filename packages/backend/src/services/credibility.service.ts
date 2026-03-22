import { prisma } from '../config/database';

export async function updateCredibility(userId: string, action: 'confirm' | 'dismiss') {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { credibilityScore: true } });
  if (!user) return;

  let newScore: number;
  if (action === 'confirm') {
    newScore = Math.min(3.0, user.credibilityScore + 0.1);
  } else {
    newScore = Math.max(0.1, user.credibilityScore - 0.3);
  }

  await prisma.user.update({ where: { id: userId }, data: { credibilityScore: newScore } });
}

export function calculateReportWeight(credibilityWeight: number, confirmationCount: number): number {
  return credibilityWeight * (1 + confirmationCount * 0.2);
}
