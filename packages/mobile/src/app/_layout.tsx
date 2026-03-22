import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';

export default function RootLayout() {
  const token = useAuthStore((s) => s.token);
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadFromStorage().finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="report/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="report/[id]" />
    </Stack>
  );
}
