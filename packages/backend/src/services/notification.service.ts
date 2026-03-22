import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '../config/database';

const expo = new Expo();

interface NotificationPayload {
  title: string;
  body: string;
  data: Record<string, unknown>;
}

export async function sendToUsers(userIds: string[], payload: NotificationPayload) {
  if (userIds.length === 0) return;

  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, expoPushToken: { not: null } },
    select: { expoPushToken: true },
  });

  const messages: ExpoPushMessage[] = users
    .filter(u => u.expoPushToken && Expo.isExpoPushToken(u.expoPushToken))
    .map(u => ({
      to: u.expoPushToken!,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: 'default' as const,
    }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error('Push notification error:', err);
    }
  }
}
