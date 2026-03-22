import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications(token: string | null) {
  useEffect(() => {
    if (!token) return;

    async function setup() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;

      const pushToken = await Notifications.getExpoPushTokenAsync();
      await axios.post(
        `${API_URL}/api/auth/push-token`,
        { token: pushToken.data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setup();

    // Deep link to report on tap
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      const reportId = response.notification.request.content.data?.reportId as string | undefined;
      if (reportId) router.push(`/report/${reportId}`);
    });

    return () => responseSub.remove();
  }, [token]);
}
